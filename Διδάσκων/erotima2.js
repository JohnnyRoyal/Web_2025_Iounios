// db.js - Σύνδεση με τη MongoDB
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'VasiWeb';

let db;

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Επιτυχής σύνδεση με τη MongoDB');
        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error('Σφάλμα σύνδεσης με τη MongoDB:', error);
        process.exit(1);
    }
}

function getDb() {
    if (!db) {
        throw new Error('Δεν έχει γίνει σύνδεση με τη βάση δεδομένων');
    }
    return db;
}

module.exports = { connectToDatabase, getDb };

// server.js - Κύριο αρχείο του server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToDatabase } = require('./db');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/assignments', assignmentRoutes);

// Εκκίνηση του server αφού συνδεθούμε στη βάση
async function startServer() {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server τρέχει στο http://localhost:${PORT}`);
    });
}

startServer();

// routes/assignmentRoutes.js - Routes για τις αναθέσεις θεμάτων
const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { ObjectId } = require('mongodb');
const assignmentController = require('../controllers/assignmentController');

// Λήψη διαθέσιμων θεμάτων ενός καθηγητή
router.get('/topics/:professorId', assignmentController.getProfessorTopics);

// Αναζήτηση φοιτητή με βάση το ΑΜ ή το ονοματεπώνυμο
router.get('/student-search', assignmentController.searchStudent);

// Ανάθεση θέματος σε φοιτητή
router.post('/assign-topic', assignmentController.assignTopicToStudent);

// Ακύρωση ανάθεσης θέματος
router.post('/cancel-assignment', assignmentController.cancelAssignment);

module.exports = router;

// controllers/assignmentController.js - Controllers για τις αναθέσεις
const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

// Λήψη διαθέσιμων θεμάτων ενός καθηγητή
exports.getProfessorTopics = async (req, res) => {
    try {
        const db = getDb();
        const professorId = req.params.professorId;

        // Βρίσκουμε τον καθηγητή
        const professor = await db.collection('prof').findOne({ 
            _id: new ObjectId(professorId)
        });

        if (!professor) {
            return res.status(404).json({ message: 'Ο καθηγητής δεν βρέθηκε' });
        }

        // Βρίσκουμε όλα τα θέματα διπλωματικών που ανήκουν στον καθηγητή
        const topics = await db.collection('diplomatiki').find({
            'mainKathigitis._id': new ObjectId(professorId),
            'katastasi': { $in: ['υπό ανάθεση', 'ελεύθερο'] }
        }).toArray();

        res.status(200).json(topics);
    } catch (error) {
        console.error('Σφάλμα κατά την ανάκτηση θεμάτων:', error);
        res.status(500).json({ message: 'Σφάλμα κατά την ανάκτηση θεμάτων', error: error.message });
    }
};

// Αναζήτηση φοιτητή με βάση το ΑΜ ή το ονοματεπώνυμο
exports.searchStudent = async (req, res) => {
    try {
        const db = getDb();
        const searchTerm = req.query.q;

        // Αν είναι αριθμός, υποθέτουμε ότι είναι ΑΜ φοιτητή
        let query = {};
        if (!isNaN(searchTerm)) {
            query = { arithmosMitroou: parseInt(searchTerm) };
        } else {
            // Αλλιώς ψάχνουμε με βάση το όνομα ή το επώνυμο
            query = {
                $or: [
                    { onoma: { $regex: searchTerm, $options: 'i' } },
                    { epitheto: { $regex: searchTerm, $options: 'i' } }
                ]
            };
        }

        const students = await db.collection('student').find(query).toArray();

        res.status(200).json(students);
    } catch (error) {
        console.error('Σφάλμα κατά την αναζήτηση φοιτητή:', error);
        res.status(500).json({ message: 'Σφάλμα κατά την αναζήτηση φοιτητή', error: error.message });
    }
};

// Ανάθεση θέματος σε φοιτητή
exports.assignTopicToStudent = async (req, res) => {
    try {
        const db = getDb();
        const { topicId, studentId, professorId } = req.body;

        // Βρίσκουμε το θέμα
        const topic = await db.collection('diplomatiki').findOne({
            _id: new ObjectId(topicId)
        });

        if (!topic) {
            return res.status(404).json({ message: 'Το θέμα δεν βρέθηκε' });
        }

        // Ελέγχουμε αν το θέμα είναι ελεύθερο
        if (topic.katastasi !== 'ελεύθερο' && topic.katastasi !== 'υπό ανάθεση') {
            return res.status(400).json({ message: 'Το θέμα δεν είναι διαθέσιμο για ανάθεση' });
        }

        // Βρίσκουμε τον φοιτητή
        const student = await db.collection('student').findOne({
            _id: new ObjectId(studentId)
        });

        if (!student) {
            return res.status(404).json({ message: 'Ο φοιτητής δεν βρέθηκε' });
        }

        // Βρίσκουμε τον καθηγητή
        const professor = await db.collection('prof').findOne({
            _id: new ObjectId(professorId)
        });

        if (!professor) {
            return res.status(404).json({ message: 'Ο καθηγητής δεν βρέθηκε' });
        }

        // Ελέγχουμε αν ο φοιτητής έχει ήδη διπλωματική
        const existingDiploma = await db.collection('diplomatiki').findOne({
            'foititis._id': new ObjectId(studentId),
            'katastasi': { $in: ['υπό ανάθεση', 'ενεργή', 'υπό εξέταση'] }
        });

        if (existingDiploma) {
            return res.status(400).json({ 
                message: 'Ο φοιτητής έχει ήδη αναλάβει άλλη διπλωματική εργασία',
                existingTopic: existingDiploma.titlos
            });
        }

        // Ενημερώνουμε το θέμα
        const updateResult = await db.collection('diplomatiki').updateOne(
            { _id: new ObjectId(topicId) },
            { 
                $set: {
                    katastasi: 'υπό ανάθεση',
                    foititis: {
                        _id: new ObjectId(studentId),
                        onoma: student.onoma,
                        epitheto: student.epitheto,
                        arithmosMitroou: student.arithmosMitroou
                    },
                    imerominiaProsorinisAnathesis: new Date(),
                    proigoumenesKatastaseis: topic.proigoumenesKatastaseis ? 
                        [...topic.proigoumenesKatastaseis, 'ελεύθερο'] : 
                        ['ελεύθερο']
                }
            }
        );

        // Ενημερώνουμε και τον φοιτητή με το θέμα που του έχει ανατεθεί
        await db.collection('student').updateOne(
            { _id: new ObjectId(studentId) },
            {
                $set: {
                    titlosDiplomatikis: topic.titlos,
                    katastasiFoititi: 'υπό ανάθεση'
                }
            }
        );

        res.status(200).json({ 
            message: 'Το θέμα ανατέθηκε προσωρινά στον φοιτητή με επιτυχία',
            topic: {
                _id: topic._id,
                titlos: topic.titlos,
                katastasi: 'υπό ανάθεση'
            },
            student: {
                _id: student._id,
                onoma: student.onoma,
                epitheto: student.epitheto,
                arithmosMitroou: student.arithmosMitroou
            }
        });
    } catch (error) {
        console.error('Σφάλμα κατά την ανάθεση θέματος:', error);
        res.status(500).json({ message: 'Σφάλμα κατά την ανάθεση θέματος', error: error.message });
    }
};

// Ακύρωση ανάθεσης θέματος
exports.cancelAssignment = async (req, res) => {
    try {
        const db = getDb();
        const { topicId, professorId } = req.body;

        // Βρίσκουμε το θέμα
        const topic = await db.collection('diplomatiki').findOne({
            _id: new ObjectId(topicId)
        });

        if (!topic) {
            return res.status(404).json({ message: 'Το θέμα δεν βρέθηκε' });
        }

        // Ελέγχουμε αν το θέμα είναι υπό ανάθεση
        if (topic.katastasi !== 'υπό ανάθεση') {
            return res.status(400).json({ message: 'Το θέμα δεν είναι σε κατάσταση υπό ανάθεση' });
        }

        // Ελέγχουμε αν ο καθηγητής είναι ο επιβλέπων του θέματος
        if (topic.mainKathigitis._id.toString() !== professorId) {
            return res.status(403).json({ message: 'Δεν έχετε δικαίωμα να ακυρώσετε αυτή την ανάθεση' });
        }

        // Κρατάμε τα στοιχεία του φοιτητή για να ενημερώσουμε και το δικό του αρχείο
        const studentId = topic.foititis._id;

        // Ενημερώνουμε το θέμα
        await db.collection('diplomatiki').updateOne(
            { _id: new ObjectId(topicId) },
            { 
                $set: {
                    katastasi: 'ελεύθερο',
                    foititis: null,
                    imerominiaProsorinisAnathesis: null,
                    proigoumenesKatastaseis: topic.proigoumenesKatastaseis ? 
                        [...topic.proigoumenesKatastaseis, 'υπό ανάθεση'] : 
                        ['υπό ανάθεση']
                }
            }
        );

        // Ενημερώνουμε και τον φοιτητή
        await db.collection('student').updateOne(
            { _id: new ObjectId(studentId) },
            {
                $set: {
                    titlosDiplomatikis: null,
                    katastasiFoititi: 'ενεργός' // Επαναφέρουμε στην απλή ενεργή κατάσταση
                }
            }
        );

        // Ακυρώνουμε τυχόν προσκλήσεις προς μέλη τριμελούς
        // Αυτό υποθέτει ότι οι προσκλήσεις είναι αποθηκευμένες σε κάποιο πεδίο του θέματος ή σε ξεχωριστή συλλογή
        // Εδώ απλώς υποθέτουμε ότι υπάρχει ένα πεδίο proskliseis στο θέμα
        if (topic.proskliseis && topic.proskliseis.length > 0) {
            await db.collection('diplomatiki').updateOne(
                { _id: new ObjectId(topicId) },
                { $set: { proskliseis: [] } }
            );
        }

        res.status(200).json({ 
            message: 'Η ανάθεση θέματος ακυρώθηκε με επιτυχία',
            topic: {
                _id: topic._id,
                titlos: topic.titlos,
                katastasi: 'ελεύθερο'
            }
        });
    } catch (error) {
        console.error('Σφάλμα κατά την ακύρωση ανάθεσης:', error);
        res.status(500).json({ message: 'Σφάλμα κατά την ακύρωση ανάθεσης', error: error.message });
    }
};

// Client-side ενδεικτικός κώδικας AJAX για την αναζήτηση φοιτητή
/*
function searchStudent(searchTerm) {
    fetch(`/api/assignments/student-search?q=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            // Εμφάνιση των αποτελεσμάτων στο UI
            displayStudentResults(data);
        })
        .catch(error => {
            console.error('Σφάλμα κατά την αναζήτηση:', error);
            showErrorMessage('Παρουσιάστηκε σφάλμα κατά την αναζήτηση φοιτητή');
        });
}

// Client-side ενδεικτικός κώδικας AJAX για την ανάθεση θέματος
function assignTopic(topicId, studentId, professorId) {
    fetch('/api/assignments/assign-topic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topicId, studentId, professorId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showSuccessMessage(data.message);
                // Ανανέωση του UI για να δείξει την αλλαγή κατάστασης
                updateTopicStatus(topicId, 'υπό ανάθεση', data.student);
            }
        })
        .catch(error => {
            console.error('Σφάλμα κατά την ανάθεση:', error);
            showErrorMessage('Παρουσιάστηκε σφάλμα κατά την ανάθεση του θέματος');
        });
}

// Client-side ενδεικτικός κώδικας AJAX για την ακύρωση ανάθεσης
function cancelAssignment(topicId, professorId) {
    fetch('/api/assignments/cancel-assignment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topicId, professorId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showSuccessMessage(data.message);
                // Ανανέωση του UI για να δείξει την αλλαγή κατάστασης
                updateTopicStatus(topicId, 'ελεύθερο', null);
            }
        })
        .catch(error => {
            console.error('Σφάλμα κατά την ακύρωση:', error);
            showErrorMessage('Παρουσιάστηκε σφάλμα κατά την ακύρωση της ανάθεσης');
        });
}
*/