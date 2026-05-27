import pkg from "agenda"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const Agenda = pkg

// Check if MONGO_URI exists
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in .env")
  process.exit(1)
}

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI,
    collection: "agendaJobs",
  },
})

export default agenda