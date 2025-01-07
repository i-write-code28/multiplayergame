
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider} from 'react-router-dom'
import Router from '../Routes/Router'
import { Provider } from'react-redux'
import {store} from '.././Redux/Store/Store'
createRoot(document.getElementById('root')).render(
    <Provider store={store}>
<RouterProvider router={Router}/>
</Provider>
)
