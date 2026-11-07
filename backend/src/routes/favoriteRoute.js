const express = require("express");
const router = express.Router();

const favoriteController = require("../controllers/favoriteController");
const authMiddleware = require("../middlewares/auth");

router.post("/:businessId", authMiddleware, favoriteController.addFavorite);

router.delete("/:businessId", authMiddleware, favoriteController.removeFavorite);

router.get("/favorites", authMiddleware, favoriteController.getFavorites);

module.exports = router;