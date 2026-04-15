
import app from "./app";
import { prisma } from "./lib/prisma";



const PORT = process.env.PORT || 5000;

async function main() {
    try {
        await prisma.$connect();
        // console.log("Connected to the database successfully.");
      
        if(process.env.NODE_ENV !== "production"){
            app.listen(PORT, () => {
                console.log(`Server is running on ${PORT}`);
            });
        }
        
    } 
    catch (error) {
        console.error("An error occurred:", error);
        
    }
}

main();
export default app;

