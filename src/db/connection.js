import mongoose from "mongoose";

export const connect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongodb Conntection Status: Online (${conn.connection.host})`);
  } catch (error) {
    console.error(`Mongodb Conntection Status: Failed ${error.message}`);
    process.exit(1);
  }
};
