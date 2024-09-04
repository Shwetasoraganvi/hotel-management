import express from "express";
import bodyParser  from "body-parser";
import pg from "pg";

const app=express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const db=new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"hotelManagement",
  password:"shweta@2003",
  port:5432
});

db.connect();

// ----------------------Customer details----------------------------------------------------------

let details = [];

function fetchDetails(){

db.query("SELECT * FROM customer", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    details = res.rows;
  }

});

}

// ----------------------Room details----------------------------------------------------------


let roomdetails = [];

function fetchRoomDetails(){

db.query("SELECT * FROM Boocking", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    roomdetails = res.rows;
  }
  
});

}

let customerdetails=[];
let rdetails=[];
function fetchCustomerDetails(CID){

  const query="SELECT * FROM customer WHERE cid=$1";
  const query1="SELECT * FROM Boocking WHERE cno=$1";
  let val=[CID];
  console.log(val);
  db.query(query,val, (err, res) => {
    if (err) {
      console.error("Error executing query", err.stack);
    } else {
      customerdetails = res.rows;
    }
  
  });

  db.query(query1,val, (err, res) => {
    if (err) {
      console.error("Error executing query", err.stack);
    } else {
      rdetails = res.rows;
    }
  
  });
  
  }


// ------------------main page-------------------------------------------------------

app.get("/",(req,res)=>{
   
    res.render("index.ejs");
});

// -------------------end of main page-----------------------------------------------
// -------------------Customer page-----------------------------------------------

let cnum=[];
let Cid;
app.get("/customer",(req,res)=>{
  
  while(true){
     Cid=Math.floor(Math.random()*2000);
  if (cnum.includes(Cid)){
    continue;
  }
  else{
      break;
  }
}
    fetchDetails();
    res.render("customer.ejs",{value:Cid,data:details});
});

// --------------------Add customer-----------------------------------------------------------------

app.post('/add', (req, res) => {

    let cid=req.body.cid;
    console.log(cid);
    let fname=req.body.fname;
    let lname=req.body.lname;
    let phno=req.body.phno;
    let gender=req.body.gender;
    const val=[cid,fname,lname,phno,gender];

    if (isNaN(cid) || !fname || !lname || !phno || !gender) {
      return res.status(400).send("Invalid input");
    }
    

    const query = 'INSERT INTO customer(cid,fname,lname,phoneno,gender) VALUES ($1, $2,$3,$4,$5)';
    
    db.query(query, val, (err, result) => {
      if (err) {
        console.error('Error executing query', err.stack);
        res.send('Error adding data to database');
      } else {
        console.log("data addedd");
        
        cnum.push(cid);
        fetchDetails();
        res.redirect("/customer");
      }
     
    });
   });


// -----------------------------Back--------------------------------------
app.post("/back",(req,res)=>{
 res.redirect("/");
});

//-------------------------Update------------------------------------------
app.post("/update",(req,res)=>{
  let cid = req.body.cid;
  let fname = req.body.fname;
  let lname = req.body.lname;
  let phno = req.body.phno;
  let gender = req.body.gender;
  let val = [fname, lname, phno, gender, cid];

  if (isNaN(cid) || !fname || !lname || !phno || !gender) {
    return res.status(400).send("Invalid input");
  }
  const query='UPDATE customer SET fname = $1, lname = $2, phoneno = $3, gender = $4 WHERE cid = $5';

  db.query(query,val,(err,result)=>{
    if (err) {
      console.error('Error executing query', err.stack);
      res.send('Error updating data to database');
    } else {
      console.log("data Updated");
      fetchDetails();
      res.redirect("/customer");
    }
   

  });

});

//-------------------------------DELETE------------------------------------
  app.post("/delete",(req,res)=>{
    let cid=req.body.cid;
    const query="DELETE FROM customer WHERE cid=$1";
    const val=[cid];
    if (isNaN(cid)) {
      return res.status(400).send("Invalid input");
    }
    db.query(query,val,(err,result)=>{
      if (err) {
        console.error('Error executing query', err.stack);
        res.send('Error in  deleting data to database');
      } else {
        console.log("data deleted");
        fetchDetails();
        res.redirect("/customer");
        let index = cnum.indexOf(cid);
        if (index !== -1) {
          cnum.splice(index, 1); // Remove one element at the specified index
      }
      }
    });

  });



  // ----------------------------Boocking section-----------------------------------------------------
  let Rno;
  let bill;
  let roomType;
  let numdays;
  let custnum;

  app.get("/boocking",(req,res)=>{
    Rno=0;
    bill=0;
    fetchRoomDetails();
    
    res.render("Boocking.ejs",{ rdata:roomdetails,Roomno:Rno,Bill:bill,roomType:"",numdays:0,cid:0});
  });


   let sroom=[];
   let droom=[];
   let aroom=[];
   
   


  app.post("/GET",(req,res)=>{
     roomType=req.body.roomType;
     numdays=req.body.numday;
     custnum=req.body.cid;
    if(roomType==="Standard room"){
      while(true){
     Rno =  Math.floor(Math.random()*(200-100)+100);
     if(sroom.includes(Rno)){
      continue;
     }
     else{
      
      break;
     }
    }
    bill=numdays*400;
  }
  else if(roomType==="Deluxe room"){
    while(true){
      Rno = Math.floor(Math.random()*(300-201)+201);
      if(droom.includes(Rno)){
       continue;
      }
      else{
        break;
      }
     }
     bill=numdays*800;
  }
  else{
    while(true){
      Rno = Math.floor(Math.random()*(400-301)+301);
      if(aroom.includes(Rno)){
       continue;
      }
      else{
         break;
      }
     }
     bill=numdays*1000;
  }
  fetchRoomDetails();
res.render("Boocking.ejs",{rdata:roomdetails,Roomno:Rno,Bill:bill,roomType:roomType,numdays:numdays,cid:custnum});

  });



  // -----------------------adding boockking----------------------------------------------------------------
  app.post("/book",(req,res)=>{
    let cid=req.body.cid;
    console.log(cid);
    let roomtype=req.body.roomType;
    let rno=req.body.rno;
    let bill=req.body.bill;
    let numdays=req.body.numday;
    const val=[rno,cid,roomtype,numdays,bill];

    if (isNaN(cid) || !roomtype || !rno || !bill || !numdays) {
      return res.status(400).send("Invalid input");
    }
    

    const query = 'INSERT INTO Boocking(Rno,Cno,roomtype,numdays,bill) VALUES ($1,$2,$3,$4,$5)';
    
    db.query(query, val, (err, result) => {
      if (err) {
        console.error('Error executing query', err.stack);
        res.send('Error adding data to database');
      } else {
        console.log("data addedd");
        
        if(roomType==="Standard room"){
          sroom.push(Rno);
        }
        else if(roomType==="Deluxe room"){
          droom.push(Rno);
        }else{
          aroom.push(Rno);
        }
        fetchRoomDetails();
        res.redirect("/boocking");
      }
     
    });
  });


  // ----------------------------------Updating--------------------------------------------------------------


  app.post("/bookupdate",(req,res)=>{
    let cno=req.body.cid;
    let roomtype=req.body.roomType;
    let rno=req.body.rno;
    let numdays=req.body.numday;

    if(roomtype==="Standard room"){
      bill=numdays*400;
    }
    else if(roomtype==="Deluxe room"){
      bill=numdays*800;
    }else{
      bill=numdays*1000;
      
    }
    
    let val=[roomtype,numdays,bill,cno,rno];
    console.log(val)
  
    if (isNaN(cno) ||  isNaN(numdays) || isNaN(rno) || !roomtype ) {
      return res.status(400).send("Invalid Input");
    }
    const query='UPDATE Boocking SET roomtype = $1, numdays = $2, bill = $3 WHERE cno = $4 AND rno=$5';
  
    db.query(query,val,(err,result)=>{
      if (err) {
        console.error('Error executing query', err.stack);
        res.send('Error updating data to database');
      } else {
        console.log("data Updated");
        fetchRoomDetails();
        res.redirect("/boocking");
      }
     
  
    });
  
  });


  // -------------------------------------------------LOGOUT-------------------------------------------------------------




  app.post("/logout",(req,res)=>{
    let cid=req.body.cid;
    let rno= req.body.rno;
    const query="DELETE FROM Boocking WHERE cno=$1 AND rno=$2";
    const val=[cid,rno];
    if (isNaN(cid) || isNaN(rno)) {
      return res.status(400).send("Invalid input");
    }
    db.query(query,val,(err,result)=>{
      if (err) {
        console.error('Error executing query', err.stack);
        res.send('Error in  deleting data to database');
      } else {
        console.log("data deleted");
        fetchRoomDetails();
        res.redirect("/boocking");
        let index = sroom.indexOf(rno);
        let index1 = droom.indexOf(rno);
        let index2 = aroom.indexOf(rno);


        if (index !== -1) {
          sroom.splice(index, 1); // Remove one element at the specified index
        }
        if (index1 !== -1) {
          droom.splice(index, 1); // Remove one element at the specified index
        }
        if (index2 !== -1) {
          aroom.splice(index, 1); // Remove one element at the specified index
        }
      }
    });

  });



  // -------------------------------------------DETAILS--------------------------------------------------------

app.get("/cdetails",(req,res)=>{
  res.render("details.ejs");
});

app.post("/getdetails",(req,res)=>{
  let cid = req.body.cid;
  fetchCustomerDetails(cid);
  console.log(customerdetails)
  res.render("details.ejs",{cdetails:customerdetails,rdetails:rdetails});

});

app.listen(PORT,()=>{
    console.log("Server is running on port ${PORT}");
});

