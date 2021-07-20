import React from 'react'
import HomeStyle from '../../components/home/HomeStyle'
import { Link } from 'react-router-dom'
import List from '../../components/shop/SalonList'


function Home() {
	return(
	<>
    <ul>
            <li><Link to='../shop'>レストラン</Link></li>
            <li><Link to='../shop/list'>美容院</Link></li>
    </ul>
  </>

    )
}

export default Home