const mongoose = require("mongoose");
const User = require("../models/User");

mongoose.connect("mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/bookhiveDB", { useNewUrlParser: true, useUnifiedTopology: true });

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    await User.create([
      { name: "John Doe", email: "john@example.com", password: "password123" },
    ]);
    console.log("Seeding Complete");
    mongoose.connection.close();
  } catch (error) {
    console.log("Seeding Error:", error);
  }
};

seedUsers();
