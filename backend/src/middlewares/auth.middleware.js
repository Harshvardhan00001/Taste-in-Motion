const foodPartnerModel=require("../models/foodpartner.model")
const jwt=require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authFoodPartnerMiddleware(req,res,next){
    const token=req.cookies.token;
    if(!token){
       return res.status(401).json({
            message:"please login first"
        })

    }

    try{
       const decoded= jwt.verify(token,process.env.SECRET_KEY)
       const foodPartner=await foodPartnerModel.findById(decoded._id)
       
       req.foodPartner=foodPartner
      
       next()

    }
    catch(err){
       res.status(401).json({
        message:"invalid token"
       })

    }
}
async function authUserMiddleware(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Please login first"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        const user = await userModel.findById(decoded._id);

        req.user = user

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token"
        })

    }

}

module.exports={authFoodPartnerMiddleware,   authUserMiddleware
}