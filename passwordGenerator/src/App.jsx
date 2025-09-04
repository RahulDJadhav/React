import { useState, useCallback, useEffect, useRef } from "react"

function App() {

  const [length, setLength] = useState(8);
  const [numbersAllowed, setNumbersAllowed] = useState(false);
  const [splCharsAllowed, setSplCharsAllowed] = useState(false);
  const [password, setPassword] = useState('');

  


  const generatePassword = useCallback (() => {
    let pass ="";
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    if (numbersAllowed) str += "0123456789";
    if (splCharsAllowed) str += "!@#$%^&*()";

    for (let i = 1; i <= length; i++) {
      let char = Math.floor(Math.random() * str.length + 1);
      pass += str.charAt(char);
    }
    setPassword(pass);  
  } , [length, numbersAllowed, splCharsAllowed, setPassword])


  // useRef hook
  const passwordRef = useRef(null);
  const copyPassword = useCallback(() => {
    passwordRef.current?.select();
    passwordRef.current?.setSelectionRange(0, 9999); 
    
    window.navigator.clipboard.writeText(password)
  }, [password])

  useEffect(() => {
    generatePassword();
  }, [length, numbersAllowed, splCharsAllowed, generatePassword])

  return (
    <>

      <div className="w-full max-w-md mx-auto shadow-md rounded-lg px-4 py-3 my-8 text-orange-500 bg-gray-800 text-orange-500">
        <h1 className="text-white text-center my-3">Password Generator</h1>
        <div className="flex shadow rounded-lg overflow-hidden mb-4">
          <input 
          type="text"
          value={password}
          className="outline-none w-full py-1 px-3 bg-white"
          placeholder="Password"
          readOnly

          ref={passwordRef}
           />
           <button 
           onClick={copyPassword}
           className="outline-none bg-green-500 text-white px-3 py-1 cursor-pointer">copy</button>
        </div>
        <div className="flex text-sm gap-x-2">
            <div className="flex items-center gap-x-1">
              <input type="range"
              min={6}
              max={100}
              value={length}
              className="cursor-pointer"
              onChange={(e) => setLength(e.target.value)}
               />
              <label>Length: {length}</label>
            </div>
            <div className="flex items-center gap-x-1">
              <input type="checkbox"
              defaultChecked={numbersAllowed}
              onChange={(e) => {setNumbersAllowed((prev) => !prev)} }
               />
               <label className="">Numbers</label>
            </div>
            <div className="flex items-center gap-x-1">
              <input type="checkbox"
              defaultChecked={splCharsAllowed}
              onChange={() => {setSplCharsAllowed((prev) => !prev)} }
               />
               <label className="">Charactors</label>
            </div>
        </div>
      </div>
    </>
  )
}

export default App
