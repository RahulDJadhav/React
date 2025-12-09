import { Injectable, OnModuleInit, OnModuleDestroy, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { SignJWT, importPKCS8 } from 'jose';
import * as snowflake from 'snowflake-sdk';
import * as yaml from 'js-yaml';
import * as fs from 'fs/promises';
import config from '../../config/snowflake.config';

@Injectable()
export class SnowflakeAnalystService implements OnModuleInit, OnModuleDestroy {
  private cfg = config().snowflake;
  private connection: any;
  private jwtCache: { token: string; expiresAt: number } | null = null;
  private publicKeyFpCache: string | null = null;
  private semanticModel: any = null;

  async onModuleInit() {
    await Promise.all([
      this.initializeConnection(),
      this.loadSemanticModel()
    ]);
  }

  async onModuleDestroy() {
    if (this.connection) {
      await new Promise((resolve) => {
        this.connection.destroy((err) => {
          if (err) console.error('Error closing connection:', err);
          resolve(undefined);
        });
      });
    }
  }

  private async loadSemanticModel() {
    try {
      const modelPath = `./semantic-models/${this.cfg.model}.yaml`;
      const yamlContent = await fs.readFile(modelPath, 'utf8');
      this.semanticModel = yaml.load(yamlContent);
    } catch (fsError) {
      console.warn('[SemanticModel] Failed to load from file system:');
      
      try {
        this.semanticModel = await this.fetchModelFromStage();
      } catch (stageError) {
        console.error('[SemanticModel] Failed to load from stage:', stageError.message);
        this.semanticModel = null;
      }
    }
  }

  private async fetchModelFromStage(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error('Connection not initialized'));
        return;
      }

      const stagePath = `@${this.cfg.database}.${this.cfg.schema}.${this.cfg.stage}/${this.cfg.model}.yaml`;
      const sqlText = `SELECT $1 FROM ${stagePath}`;

      this.connection.execute({
        sqlText,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Failed to fetch model from stage:', err);
            reject(err);
          } else {
            try {
              // Parse the YAML content from stage
              const yamlContent = rows[0]?.$1 || rows[0]?.['$1'];
              const model = yaml.load(yamlContent);
              resolve(model);
            } catch (parseErr) {
              reject(parseErr);
            }
          }
        }
      });
    });
  }

  private async initializeConnection() {
    return new Promise((resolve, reject) => {
      this.connection = snowflake.createConnection({
        account: this.cfg.account,
        username: this.cfg.user,
        role: this.cfg.role,
        warehouse: this.cfg.warehouse,
        database: this.cfg.database,
        schema: this.cfg.schema,
        authenticator: 'SNOWFLAKE_JWT',
        privateKey: this.cfg.privateKey
      });

      this.connection.connect((err) => {
        if (err) {
          console.error('Failed to initialize Snowflake connection:', err);
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  private async generateJwt() {
    if (this.jwtCache && this.jwtCache.expiresAt > Date.now() + 300000) {
      return this.jwtCache.token;
    }

    if (!this.cfg.privateKey) {
      throw new Error('Private key not found in env');
    }

    const pk = await importPKCS8(this.cfg.privateKey, 'RS256');

    const accountIdentifier = this.cfg.account.split('.')[0].toUpperCase();
    const user = this.cfg.user.toUpperCase();
    const qualifiedUsername = `${accountIdentifier}.${user}`;

    const now = Math.floor(Date.now() / 1000);

    const publicKeyFp = await this.getPublicKeyFingerprint();
    const issuer = `${qualifiedUsername}.SHA256:${publicKeyFp}`;

    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .setIssuer(issuer)
      .setSubject(qualifiedUsername)
      .sign(pk);

    this.jwtCache = {
      token: jwt,
      expiresAt: Date.now() + 3600000
    };

    return jwt;
  }

  private async getPublicKeyFingerprint(): Promise<string> {
    if (this.publicKeyFpCache) {
      return this.publicKeyFpCache;
    }

    const crypto = await import('crypto');
    
    const privateKeyObject = crypto.createPrivateKey({
      key: this.cfg.privateKey,
      format: 'pem',
    });
    
    const publicKeyDer = crypto.createPublicKey(privateKeyObject).export({
      type: 'spki',
      format: 'der',
    });
    
    const hash = crypto.createHash('sha256');
    hash.update(publicKeyDer);
    this.publicKeyFpCache = hash.digest('base64');
    
    return this.publicKeyFpCache;
  }

  async ask(prompt: string, executeQuery: boolean = true) {
    try {
      const token = await this.generateJwt();

      const url = `https://${this.cfg.account}.snowflakecomputing.com/api/v2/cortex/analyst/message`;

      const body: any = {
        model: "cortex-analyst",
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        session: { mode: "execute", run_sql: executeQuery }
      };

      // Use inline semantic model if loaded, otherwise fallback to stage reference
      if (this.semanticModel) {
        body.semantic_model = yaml.dump(this.semanticModel);
      } else {
        body.semantic_model_file = `@${this.cfg.database}.${this.cfg.schema}.${this.cfg.stage}/${this.cfg.model}.yaml`;
      }

      const res = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Snowflake-Authorization-Token-Type': 'KEYPAIR_JWT'
        },
      });
      
      const parsedResponse = this.parseAnalystResponse(res.data);
      
      if (executeQuery && parsedResponse.sql) {
        parsedResponse.results = await this.executeQuery(parsedResponse.sql, 60000);
      }
      
      return parsedResponse;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Cortex Analyst request failed';
      throw new InternalServerErrorException(errorMessage);
    }
  }

  private parseAnalystResponse(data: any) {
    const content = data.message?.content || [];
    
    let explanation = null;
    let sql = null;
    
    for (const item of content) {
      if (item.type === 'text') {
        explanation = item.text;
      } else if (item.type === 'sql') {
        sql = item.statement;
      }
    }
    
    return {
      explanation,
      sql,
      results: [],
      request_id: data.request_id,
      raw: data
    };
  }

  private async executeQuery(sqlStatement: string, timeoutMs?: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error('Snowflake connection not initialized'));
        return;
      }

      let timeoutHandle: NodeJS.Timeout | undefined;
      let completed = false;

      // Set timeout if specified
      if (timeoutMs && timeoutMs > 0) {
        timeoutHandle = setTimeout(() => {
          if (!completed) {
            completed = true;
            reject(new Error(`Query execution timeout after ${timeoutMs}ms`));
          }
        }, timeoutMs);
      }

      this.connection.execute({
        sqlText: sqlStatement,
        complete: (err, stmt, rows) => {
          if (!completed) {
            completed = true;
            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
            }
            
            if (err) {
              console.error('Query execution failed:', err);
              reject(err);
            } else {
              resolve(rows || []);
            }
          }
        }
      });
    });
  }
}