# 🔍 SQL Detective: The Exeter Graffiti Mystery

An interactive browser-based SQL learning game where students solve a detective mystery by writing SQL queries. The game features a visual query builder with drag-and-drop functionality and a stylized SQL result viewer.

## 🎮 Game Overview

**The Case:** Graffiti has appeared on a wall in Exeter city center with the message "SQL is Rubbish". Students must investigate this crime by querying a SQLite database to piece together a timeline of events and identify the culprit.

## ✨ Features

- **Client-Side SQLite Database**: Uses sql.js (SQLite compiled to WebAssembly) to run a full SQL database in the browser
- **Visual Query Builder**: Drag-and-drop interface for building SQL queries without typing
- **SQL Editor**: Traditional text-based SQL editor with syntax highlighting support
- **Stylized Results Viewer**: Beautiful, modern display of query results with special timeline visualization
- **Clue System**: Discover clues by running specific queries that reveal important information
- **Multiple Tables**: Explore suspects, locations, timeline, witnesses, evidence, and CCTV footage
- **No Backend Required**: Everything runs client-side - perfect for educational environments

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A local web server (optional, but recommended)

### Installation

1. Clone or download this repository
2. Open `index.html` in a web browser, OR
3. Serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

4. Navigate to `http://localhost:8000` in your browser

## 📊 Database Schema

The game includes 6 tables:

### `suspects`
People of interest in the case
- id, name, age, occupation, address, alibi, motive, suspicious_level

### `locations`
Places relevant to the investigation
- id, name, address, location_type, description, distance_from_crime

### `timeline`
Chronological events related to the crime
- id, timestamp, event_description, location_id, suspect_id, evidence_type

### `witnesses`
People who witnessed events
- id, name, statement, credibility, location_id

### `evidence`
Physical evidence collected
- id, item_name, description, found_at_location, found_by, relevance

### `cctv`
Security camera footage
- id, camera_location, timestamp, person_seen, activity_description, location_id

## 🎯 How to Play

1. **Explore the Database**: Click on tables in the left panel to see their structure
2. **Build Queries**: 
   - Use the Visual Builder tab to drag and drop table/column names
   - Or use the SQL Editor tab to write queries directly
3. **Run Queries**: Click "Run Query" to execute and see results
4. **Discover Clues**: Certain queries will unlock clues that help solve the mystery
5. **Solve the Case**: Piece together the timeline and identify the culprit!

## 📝 Example Queries

```sql
-- View all suspects
SELECT * FROM suspects;

-- Find most suspicious person
SELECT name, suspicious_level FROM suspects ORDER BY suspicious_level DESC;

-- See timeline of events
SELECT * FROM timeline ORDER BY timestamp;

-- Join suspects with timeline events
SELECT s.name, t.event_description, t.timestamp 
FROM timeline t 
JOIN suspects s ON t.suspect_id = s.id 
ORDER BY t.timestamp;

-- Analyze locations
SELECT l.name, COUNT(t.id) as events 
FROM locations l 
LEFT JOIN timeline t ON l.id = t.location_id 
GROUP BY l.name;
```

## 🛠️ Technology Stack

- **sql.js**: SQLite compiled to WebAssembly for client-side database operations
- **Vanilla JavaScript**: No frameworks required
- **HTML5 & CSS3**: Modern, responsive design
- **Web APIs**: Drag and Drop API, LocalStorage (optional)

## 🎨 Features in Detail

### Visual Query Builder
- Drag tables and columns from the schema panel
- Drop into SELECT, FROM, WHERE, and ORDER BY zones
- Automatically generates SQL code
- Great for beginners learning SQL structure

### Timeline Visualization
- When querying timeline data, results are displayed as a visual timeline
- Shows chronological progression of events
- Makes it easier to understand the sequence of the crime

### Clue System
- 8 different clues to discover
- Clues unlock as students run relevant queries
- Progress tracking shows how many clues have been found
- Mystery solved when key clues are discovered

## 📚 Educational Use

This game is perfect for:
- SQL beginners learning basic queries
- Students practicing JOIN operations
- Understanding database relationships
- Learning to analyze data to solve problems
- Making SQL learning fun and engaging

## 🔧 Customization

You can easily customize:
- **Crime Story**: Modify the story and clues in `gameLogic.js`
- **Database Schema**: Change tables and data in `database.js`
- **Styling**: Update colors and layout in `styles.css`
- **Clues**: Add or modify clue definitions in `gameLogic.js`

## 📄 License

This project is open source and available for educational use.

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements!

## 🎓 Learning Objectives

By playing this game, students will learn:
- Basic SQL SELECT statements
- Filtering with WHERE clauses
- Sorting with ORDER BY
- Joining multiple tables
- Aggregating data with GROUP BY
- Analyzing data to solve problems
- Understanding database relationships

---

**Happy Detective Work!** 🕵️‍♂️
