
// Importation du module MongoClient depuis la bibliothèque 'mongodb'
const MongoClient = require('mongodb').MongoClient;

// ---Todo1----
// Changer l'URL de connexion à la base de données MongoDB avec votre propre URL de connexion
const url = 'mongodb+srv://quentinvarma:sYv5dGJiBpOCGtxU@cluster0.nsqo5dz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


// Connexion à la base de données
MongoClient.connect(url).then(client => {
  console.log("Connexion réussie");
  
// Sélection de la base de données 'ma base de données SpaceX'
  const db = client.db('test');
   

// ---Todo2---
//Ajouter des documents dans la collection 'users' de la base de données 'ma base de données SpaceX' selon les besoins de votre formulaire 
//d'inscription  (https://www.w3schools.com/mongodb/index.php)
    db.posts.find({category:'users'})
    const documents = [
      {"name": "varma", "prénom": "quentin" , "email":"quentinvarma@gmail.com", "password": "Caca123prout"}
    ];
    


// Insértion des documents dans la collection 'users' de la base de données 'ma base de données SpaceX'
    return db.collection('users').insertMany(documents);
  })
  .then(result => {
    console.log(`${result.insertedCount} documents inserted`);
  })
  .catch(err => {
    console.error(err);
});