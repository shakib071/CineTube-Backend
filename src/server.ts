import { env } from "node:process";
import app from "./app";
import { prisma } from "./lib/prisma";
import { envVars } from "./config/env";

const PORT = envVars.PORT || 5000;

async function main() {
    try {
        await prisma.$connect();
        // console.log("Connected to the database successfully.");
      
            app.listen(PORT, () => {
                console.log(`Server is running on ${PORT}`);
            });
        
    } 
    catch (error) {
        console.error("An error occurred:", error);
        
    }
}

main();

