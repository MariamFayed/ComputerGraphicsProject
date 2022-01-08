const express = require('express'); 
const app = express();            
var port = process.env.PORT || 5000;                

app.use(express.static('index.js'));   
                                        

app.listen(port, () => {    
    console.log(`Now listening on port ${port}`); 
});