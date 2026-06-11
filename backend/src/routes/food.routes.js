const express = require("express");
const router = express.Router();
const foodController = require("../controllers/food.controller")
const AuthMiddleware = require("../middlewares/auth.middleware")
const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() })

// ✅ Specific GET routes FIRST
router.get('/save',
    AuthMiddleware.authUserMiddleware,
    foodController.getSaveFood
)

router.get("/",
    AuthMiddleware.authUserMiddleware,
    foodController.getFoodItems)

router.post('/',
    AuthMiddleware.authFoodPartnerMiddleware,
    upload.single("mama"),
    foodController.createFood)

router.post('/like',
    AuthMiddleware.authUserMiddleware,
    foodController.likeFood)

router.post('/save',
    AuthMiddleware.authUserMiddleware,
    foodController.saveFood)

module.exports = router;