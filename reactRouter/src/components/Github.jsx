import React, {useEffect, useState} from 'react'

function Github() {
  const [data, setData] = useState([]);

  useEffect(() => {  

    fetch('https://api.github.com/users/RahulDJadhav')

      .then(response => response.json())
      .then(data => {
        console.log(data);
        setData(data)
  })
      
  }, [])

  return (
    <>

      <div className='text-3xl font-bold text-center bg-gray-600 text-white'>
      <h1 className='text-center text-2xl font-semibold my-5'>Welcome to Github Profile</h1>
        <img className='text-center m-4 p-4' src={data.avatar_url} alt="Git picture" width={300}/>  
        
        </div>
    </>
  )
}

export default Github
