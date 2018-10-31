const express = require('express');
const router = express.Router();

router.get('/',(req,res,next)=>{
    
    res.render('../public/views/seller.html');
});

module.exports = router;