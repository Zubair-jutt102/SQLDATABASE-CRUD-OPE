const express = require("express");
const app = express();
let port = 8080;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "/views"))
const methodOverride = require("method-override")
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}))
const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "delta_app",
    password: "jutt102"
  });
  let getRandomUser = ()=>  {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ]
  };
//   let q = "INSERT INTO user (id, username, email, password) VALUES ?";
//   let data = [];
//   for(let i = 1; i <= 100; i++){
//     data.push(getRandomUser());
//   };
// //   let users = [[1234, "zubair1253", "abcrt@gmail.com", "aggbc"],[234, "muneeb119", "mun123@gmail.com", "asd"]]

// try{
//     connection.query(q, [data], (err, result)=>{

//         if(err) throw err;
//         console.log(result);
//       });
// }
// catch(err){
//     console.log(err)
// };
// connection.end()


// NWEW 

// const express = require("express");
// const app = express();
// let port = 8080;
// const { faker } = require('@faker-js/faker');
// const mysql = require('mysql2');

// // Create a connection to the MySQL database
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     database: 'delta_app',
//     password: 'jutt102'
// });

// // Function to generate a random user
// const getRandomUser = () => {
//     return [
//         faker.string.uuid(),           // Generate a unique identifier
//         faker.internet.userName(),     // Generate a username
//         faker.internet.email(),        // Generate an email address
//         faker.internet.password(),     // Generate a password
//     ];
// };

// SQL query to insert multiple users
// const query = 'INSERT INTO user (id, username, email, password) VALUES ?';

// // Array to hold multiple users
// const data = [];

// // Generate 100 random users
// for (let i = 0; i < 100; i++) {
//     data.push(getRandomUser());
// }

// // Insert users into the database
// connection.query(query, [data], (err, result) => {
//     if (err) {
//         console.error('Error inserting data:', err);
//     } else {
//         console.log('Insert result:', result);
//     }
//     connection.end(); // Close the connection after the query is done
// });
// HOME ROUTE 
app.get("/",(req,res)=>{
  let q = `SELECT Count(*) FROM user`;
  try{
    connection.query(q, (err, result)=>{

        if(err) throw err;
        // console.log(result[0]["Count(*)"]);
        let count = (result[0]["Count(*)"]);
        res.render("home.ejs", {count})
      });
}
catch(err){
    console.log(err)
    res.send("some error in DB")
};

})

// SHOW ROUTE 
app.get("/user", (req,res)=>{
  let q = `SELECT * FROM user`;
  try{
  connection.query(q, (err,users)=>{
    if(err) throw err
    // console.log(result)
    res.render("showuser.ejs", {users}) 
  })
}
  catch(err){
    console.log("error is in DB")
    res.send(err)
  }

})
// EDIT ROUTE 
app.get("/user/:id/edit", (req,res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}' `;
  try{
    connection.query(q, (err,result)=>{
      if(err) throw err
     let user = result[0];
      res.render("edit.ejs", {user}) 
    })  ;
  }
    catch(err){
      console.log(err)
      res.send("error is in DB")
    }
  
  });

// UPDATES ROUTE 
app.patch("/user/:id", (req,res)=>{
let {id} = req.params;
let {password: formpass, username: newusername} =  req.body;
// let {password: formpass, username: newusername} = req.body
  let q = `SELECT * FROM user WHERE id='${id}' `;
  try{
    connection.query(q, (err,result)=>{
      if(err) throw err;
     let user = result[0];
     if(formpass != user.password){
      res.send("Wrong password");
     }
     else{
      let q2 = `UPDATE user SET username='${newusername}' WHERE id='${id}'`;
      connection.query(q2, (err,result)=>{
        if(err) throw err;
        res.redirect("/user")
      })
     }
     
    });
  }
    catch(err){
      console.log(err)
      res.send("error is in DB")
    }

});





// ADD ROUTE 
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

// app.get("/user/:id/delete", (req, res) => {
//   let { id } = req.params;
//   let q = `SELECT * FROM user WHERE id='${id}'`;

//   try {
//     connection.query(q, (err, result) => {
//       if (err) throw err;
//       let user = result[0];
//       res.render("delete.ejs", { user });
//     });
//   } catch (err) {
//     res.send("some error with DB");
//   }
// });

// DELETE ROUTE
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen(port, ()=>{
  console.log(`server is listening to port ${port}`)
  })
