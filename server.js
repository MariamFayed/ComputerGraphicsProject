const express = require('express'); 
const app = express();            
var port = process.env.PORT || 5000;                

app.use(express.static('public')); 

app.listen(port, () => {    
    console.log(`Now listening on port ${port}`); 
});