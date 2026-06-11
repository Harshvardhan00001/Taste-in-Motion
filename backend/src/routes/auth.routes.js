const express=require('express')
const router=express.Router();
const authController=require('../controllers/auth.controller')

router.post('/user/register',authController.registerUser)
router.post('/user/login',authController.loginUser)
router.get('/user/logout',authController.logOut)

// -------foodpartner--------------------

router.post('/food-partner/register',authController.registerFoodPartner);
router.post('/food-partner/login',authController.loginFoodPartner);
router.post('/food-partner/logout',authController.logoutFoodPartner);


module.exports=router