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
  private connectionPool: any[] = [];
  private maxPoolSize = 3;
  private connectionRetryCount = 0;
  private maxRetries = 3;
  private jwtCache: { token: string; expiresAt: number } | null = null;
  private publicKeyFpCache: string | null = null;
  private semanticModel: any = null;
  private lastConnectionTime = 0;
  private connectionTimeout = 30 * 60 * 1000; // 30 minutes

  async onModuleInit() {
    await Promise.all([
      this.initializeConnection(),
      this.loadSemanticModel()
    ]);
  }

  async onModuleDestroy() {
    // Close all connections in pool
    const closePromises = this.connectionPool.map(conn => 
      new Promise((resolve) => {
        if (conn) {
          conn.destroy((err) => {
            if (err) console.error('Error closing pooled connection:', err);
            resolve(undefined);
          });
        } else {
          resolve(undefined);
        }
      })
    );
    
    if (this.connection) {
      closePromises.push(
        new Promise((resolve) => {
          this.connection.destroy((err) => {
            if (err) console.error('Error closing main connection:', err);
            resolve(undefined);
          });
        })
      );
    }
    
    await Promise.all(closePromises);
    this.connectionPool = [];
    this.connection = null;
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
      const connectionConfig = {
        account: this.cfg.account,
        username: this.cfg.user,
        role: this.cfg.role,
        warehouse: this.cfg.warehouse,
        database: this.cfg.database,
        schema: this.cfg.schema,
        authenticator: 'SNOWFLAKE_JWT',
        privateKey: this.cfg.privateKey,
        // Connection pool settings
        connectTimeout: 60000, // 60 seconds
        networkTimeout: 120000, // 2 minutes
        queryTimeout: 300000, // 5 minutes
        // Keep alive settings
        keepAlive: true,
        keepAliveInitialDelay: 0,
        // Retry settings
        maxRetries: 3,
        retryTimeout: 5000
      };

      this.connection = snowflake.createConnection(connectionConfig);

      this.connection.connect((err) => {
        if (err) {
          console.error('Failed to initialize Snowflake connection:', err);
          this.connectionRetryCount++;
          
          if (this.connectionRetryCount < this.maxRetries) {
            console.log(`Retrying connection (${this.connectionRetryCount}/${this.maxRetries})...`);
            setTimeout(() => {
              this.initializeConnection().then(resolve).catch(reject);
            }, 2000 * this.connectionRetryCount);
          } else {
            reject(err);
          }
        } else {
          console.log('Snowflake connection established successfully');
          this.connectionRetryCount = 0;
          this.lastConnectionTime = Date.now();
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
        try {
          parsedResponse.results = await this.executeQuery(parsedResponse.sql, 45000); // Reduced timeout
        } catch (queryError) {
          console.error('Query execution failed:', queryError.message);
          
          // Retry once for connection issues
          if (queryError.message && queryError.message.includes('connection')) {
            try {
              console.log('Retrying query after connection issue...');
              parsedResponse.results = await this.executeQuery(parsedResponse.sql, 30000);
            } catch (retryError) {
              console.error('Retry also failed:', retryError.message);
              parsedResponse.results = [];
              parsedResponse.queryError = this.formatQueryError(retryError);
            }
          } else {
            // Don't retry for other types of errors
            parsedResponse.results = [];
            parsedResponse.queryError = this.formatQueryError(queryError);
          }
        }
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
      results: [] as any[],
      request_id: data.request_id,
      raw: data,
      queryError: null as any
    };
  }

  private formatQueryError(error: any): any {
    const errorInfo = {
      message: error.message || 'Query execution failed',
      type: 'query_execution_error'
    };
    
    // Handle specific Snowflake error types
    if (error.code === '100040' && error.sqlState === '22007') {
      errorInfo.message = 'Invalid date format in query. Please check your date values and try again.';
      errorInfo.type = 'date_format_error';
    } else if (error.code && error.sqlState) {
      errorInfo.message = `Database error (${error.code}): ${error.message}`;
      errorInfo.type = 'database_error';
    }
    
    return errorInfo;
  }

  private async executeQuery(sqlStatement: string, timeoutMs?: number): Promise<any[]> {
    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        // Check and refresh connection if needed
        await this.ensureConnection();
        
        return await this.performQuery(sqlStatement, timeoutMs);
      } catch (error) {
        console.error(`Query attempt ${retryCount + 1} failed:`, error.message);
        
        // Check if it's a connection-related error
        const isConnectionError = this.isConnectionError(error);
        
        if (isConnectionError && retryCount < maxRetries) {
          console.log(`Connection error detected, retrying (${retryCount + 1}/${maxRetries})...`);
          
          // Force reconnection
          this.connection = null;
          retryCount++;
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          continue;
        }
        
        // If not a connection error or max retries reached, throw the error
        throw error;
      }
    }
  }
  
  private async ensureConnection(): Promise<void> {
    const now = Date.now();
    const connectionAge = now - this.lastConnectionTime;
    
    // Reconnect if connection is old, null, or not alive
    if (!this.connection || 
        !this.isConnectionAlive() || 
        connectionAge > this.connectionTimeout) {
      
      console.log('Refreshing Snowflake connection...');
      
      // Close existing connection if it exists
      if (this.connection) {
        try {
          await new Promise((resolve) => {
            this.connection.destroy(() => resolve(undefined));
          });
        } catch (e) {
          console.warn('Error closing old connection:', e.message);
        }
      }
      
      await this.initializeConnection();
    }
  }
  
  private async performQuery(sqlStatement: string, timeoutMs?: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let timeoutHandle: NodeJS.Timeout | undefined;
      let completed = false;

      // Set timeout (default to 5 minutes if not specified)
      const timeout = timeoutMs || 300000;
      timeoutHandle = setTimeout(() => {
        if (!completed) {
          completed = true;
          reject(new Error(`Query execution timeout after ${timeout}ms`));
        }
      }, timeout);

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
  
  private isConnectionError(error: any): boolean {
    if (!error || !error.message) return false;
    
    const connectionErrorPatterns = [
      'terminated connection',
      'connection lost',
      'connection closed',
      'network error',
      'socket hang up',
      'ECONNRESET',
      'ETIMEDOUT',
      'connection timeout',
      'Unable to perform operation using terminated connection'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return connectionErrorPatterns.some(pattern => 
      errorMessage.includes(pattern.toLowerCase())
    );
  }

  private isConnectionAlive(): boolean {
    try {
      if (!this.connection) return false;
      
      // Check if connection has isUp method and use it
      if (typeof this.connection.isUp === 'function') {
        return this.connection.isUp();
      }
      
      // Fallback: check if connection object exists and has required properties
      return this.connection && 
             this.connection._connection && 
             this.connection._connection.readyState === 'open';
    } catch (error) {
      console.warn('Error checking connection status:', error.message);
      return false;
    }
  }
}