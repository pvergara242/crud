const mongoose = require("mongoose");
const dburl = `mongodb+srv://Paola_Veragara:pao940816ap@cluster0-4bfxu.mongodb.net/Nova_stock?retryWrites=true&w=majority`;

mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err) => {
    !err ? console.log("conexion exitosa") : console.log(err);
})