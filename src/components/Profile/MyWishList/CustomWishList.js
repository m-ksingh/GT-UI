import  { useState,useContext, useEffect } from 'react'
import { useAuthState } from "../../../contexts/AuthContext";
import ApiService from "../../../services/api.service";
import { IcnTrashRed, PlusCircleIcon } from "../../icons"
import useToast from '../../../commons/ToastHook';
import Spinner from "rct-tpt-spnr";
import './wishList.css'
import CreateWishList from './CreateWishList';
const defaultValues = {
    name: '',
    category: '',
    tcondition: '',
    manufacturer: '',
    model: '',
};

const CustomWishList = () => {
    const Toast = useToast();
    const userDetails = useAuthState();
    const [wishList,setWishList] = useState([])
    const spinner = useContext(Spinner);
    const [show,setShow] = useState(false)
    const [selectedData,setSelectedData] =useState(defaultValues)


    
    // get custom wishlist
    const getCustomWishList = ()=>{
            spinner.show("Please wait...");
            ApiService.getCustomWishList(userDetails.user.sid).then(
                response => {
                    setWishList(response.data);
                },
                err => {
                    Toast.error({ message: err?.response?.data ? err.response?.data.error: 'Data loading error', time: 2000});
                }
            ).finally(() => {
                spinner.hide();
            });
    }

       // get custom wishlist
       const deleteWishList = (wishlistSid)=>{
        spinner.show("Please wait...");
        ApiService.deleteCustomWishList(wishlistSid).then(
            response => {
                Toast.success({ message: ' Custom wishlist deleted successfully', time: 2000});
                getCustomWishList()
            },
            err => {
                Toast.error({ message: err?.response?.data ? err.response?.data.error: 'Data loading error', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
        });
}



    useEffect(()=>{
        if(userDetails?.user?.sid){
            getCustomWishList()
        }
    },[])

  // onSelected data
  const  onSelectedData = (r)=>{
      const val ={
          name: r.name,
          sid:r.sid,
          ...JSON.parse(r.wishlistJson)
      }
      setSelectedData(val)
      setShow(true);

  }

    return(<>
        <div> Describe what kind of item you are looking for and get the notifications for matching item </div>
        <div className="mt-2">
            {wishList.length> 0 && wishList.map((r,i) => <div key={i} className="wishList-item">
                <div className="pointer"  onClick={()=>{onSelectedData(r)}}>{r.name}</div>
                <div className="pointer" onClick={()=>deleteWishList(r.sid)}>{<IcnTrashRed width="11px" fill="#000000"/>}</div>
            </div>)}
            <div onClick={()=>{setShow(true);setSelectedData(null)}} className="pointer aic"><PlusCircleIcon width={"20px"} /> <span className="ml-2">Create Custom Wishlist</span></div>
        </div>
       {show && <CreateWishList {...{show,setShow,selectedSpecificListing: selectedData,getCustomWishList}}/> }
    </>)
}
export default CustomWishList