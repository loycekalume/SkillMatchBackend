"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Configure environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Enable CORS for frontend access
app.use((0, cors_1.default)({
    origin: "http://localhost:5174",
    methods: "GET",
    credentials: true
}));
app.use(express_1.default.json());
const _dirname = path_1.default.resolve();
const booksData = (0, fs_1.readFileSync)(path_1.default.join(_dirname, "src", "db", "db.json"), "utf-8");
const books = JSON.parse(booksData);
// // Sample Books Data
// const books = [
//     { id: 1, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1937, pages: 310, publisher: "Allen & Unwin", description: "A fantasy novel.", price: 25, image: "hobbit.jpg" },
//     { id: 2, title: "1984", author: "George Orwell", genre: "Dystopian", year: 1949, pages: 328, publisher: "Secker & Warburg", description: "A dystopian social science fiction novel.", price: 20, image: "1984.jpg" },
//     { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", year: 1925, pages: 180, publisher: "Charles Scribner's Sons", description: "A novel about the American dream.", price: 15, image: "gatsby.jpg" }
// ];
// API route to get books with filtering
app.get("/api/booksFilters", (req, res) => {
    try {
        const { genre } = req.query;
        let filteredBooks = [...books];
        if (genre) {
            filteredBooks = books.filter(book => book.genre.toLowerCase() === genre.toLowerCase());
        }
        res.json(filteredBooks);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
});
app.get('/api/booksData', (req, res) => {
    res.send(booksData);
});
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
