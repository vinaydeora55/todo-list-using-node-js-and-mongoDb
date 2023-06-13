//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');
const e = require("express");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/todoListDB");
}

//  constructor objects and schemas

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Item = mongoose.model("item", itemSchema);

const listSchema = new mongoose.Schema({
  name : String,
  items :[itemSchema]
})

const List = mongoose.model("list", listSchema);


// global variable declarations

let item1 = new Item({
  name: "welcome to the todo list",
});

let item2 = new Item({
  name: "click on add to add a new item",
});

let item3 = new Item({
  name: "click on delete to delete an item",
});

let btnName;



// get requests

app.get("/", function (req, res) {
  const day = date.getDate();
  btnName = "list";

  Item.find()
    .then((items) => {
      if (items == 0) {
        Item.insertMany([item1, item2, item3])
          .then(() => {
            console.log("default items added");
            res.redirect("/");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.render("list", {
          listTitle: day,
          newListItems: items,
          btnName: btnName,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});


app.get("/:customListName",(req,res)=>{

  
  let customListName = req.params.customListName;

  List.findOne({name : customListName}).then((data)=>{

    if(data){res.render("list",{listTitle: data.name,newListItems: data.items})}
    else{
      const list = new List({
        name : customListName,
        items : [item1,item2,item3]
      });

      list.save()
      res.redirect("/"+customListName);
    
    }

    
  })
})


// post requests

app.post("/", function (req, res) {
  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = {
    name : itemName
  }


  if (listName ===  date.getDate() ){

  Item.insertMany([item]).then(()=>{console.log("new item added");})
  .catch((err)=>{console.log(err);})

  res.redirect("/");
  
  }else{
    List.findOne({name : listName}).then((foundlist)=>{
      foundlist.items.push(item);
      foundlist.save()
      res.redirect("/"+listName)
    })
  }

  // 

});

app.post("/delete", (req,res)=>{
  const listName = req.body.listName;
  const id = req.body.checkbox;

  if(listName ===  date.getDate()){

  Item.deleteMany({_id:req.body.checkbox}).then((data)=>{
    console.log(data);
  }).catch((err)=>{
    console.log(err);
  })
  res.redirect("/");}

  else{
    List.findOne({name : listName}).then((foundlist)=>{

    foundlist.items.forEach((element,index,object)=>{
        if(element._id == id){
          object.splice(index,1)
        }
            })

      foundlist.save()
      res.redirect("/"+listName)
       })}
  })



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(8080, function () {
  console.log("Server started on port 3000");
});
