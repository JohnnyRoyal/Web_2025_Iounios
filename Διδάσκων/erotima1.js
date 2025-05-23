const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;
const uri = "mongodb://localhost:27017";
const dbName = "VasiWeb";

// Middleware για το JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware για την αποθήκευση των PDF αρχείων
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Μόνο PDF αρχεία επιτρέπονται!'), false);
    }
  }
});

// Middleware για έλεγχο ταυτοποίησης
function authMiddleware(req, res, next) {
  // Εδώ θα έπρεπε να είναι ο έλεγχος του session/token
  // Για λόγους απλότητας, περνάω τον κωδικό του διδάσκοντα στο header
  const teacherId = req.headers['teacher-id'];
  
  if (!teacherId) {
    return res.status(401).json({ message: 'Απαιτείται ταυτοποίηση' });
  }
  
  req.teacherId = teacherId;
  next();
}

// Στατικά αρχεία
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Endpoint για την ανάκτηση των θεμάτων διπλωματικής του διδάσκοντα
app.get('/api/themata', authMiddleware, async (req, res) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('themata');
    
    const teacherId = req.teacherId;
    
    // Ανάκτηση θεμάτων που ανήκουν στον συγκεκριμένο διδάσκοντα
    const themata = await collection.find({ didaskontaId: teacherId }).toArray();
    
    // Προσθήκη πληροφοριών για το αν έχει γίνει ανάθεση του θέματος
    const diplomatikes = db.collection('diplomatikes');
    
    for (let thema of themata) {
      const diplomatiki = await diplomatikes.findOne({ themaId: thema._id.toString() });
      thema.isAssigned = !!diplomatiki;
      if (thema.isAssigned) {
        // Ανάκτηση στοιχείων φοιτητή
        const xristes = db.collection('xristes');
        const foititis = await xristes.findOne({ _id: new ObjectId(diplomatiki.foititisId) });
        thema.assignedTo = {
          id: foititis._id,
          name: `${foititis.onoma} ${foititis.epitheto}`,
          am: foititis.arithmosMitroou
        };
      }
    }
    
    res.json(themata);
  } catch (error) {
    console.error('Σφάλμα κατά την ανάκτηση θεμάτων:', error);
    res.status(500).json({ message: 'Σφάλμα στον εξυπηρετητή' });
  } finally {
    await client.close();
  }
});

// Endpoint για τη δημιουργία νέου θέματος διπλωματικής
app.post('/api/themata', authMiddleware, upload.single('pdfPerigrafis'), async (req, res) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('themata');
    
    const { titlos, perilipsi } = req.body;
    const didaskontaId = req.teacherId;
    
    // Έλεγχος υποχρεωτικών πεδίων
    if (!titlos || !perilipsi) {
      return res.status(400).json({ message: 'Ο τίτλος και η περίληψη είναι υποχρεωτικά πεδία' });
    }
    
    // Δημιουργία νέου θέματος
    const newThema = {
      titlos,
      perilipsi,
      didaskontaId,
      dateCreated: new Date(),
      status: 'available' // διαθέσιμο προς ανάθεση
    };
    
    // Αν υπάρχει PDF αρχείο, προσθήκη του path στο έγγραφο
    if (req.file) {
      newThema.pdfPath = req.file.path;
      newThema.pdfFilename = req.file.filename;
    }
    
    const result = await collection.insertOne(newThema);
    
    res.status(201).json({
      message: 'Το θέμα δημιουργήθηκε επιτυχώς',
      themaId: result.insertedId
    });
  } catch (error) {
    console.error('Σφάλμα κατά τη δημιουργία θέματος:', error);
    res.status(500).json({ message: 'Σφάλμα στον εξυπηρετητή' });
  } finally {
    await client.close();
  }
});

// Endpoint για την επεξεργασία θέματος διπλωματικής
app.put('/api/themata/:id', authMiddleware, upload.single('pdfPerigrafis'), async (req, res) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('themata');
    
    const themaId = req.params.id;
    const { titlos, perilipsi } = req.body;
    const didaskontaId = req.teacherId;
    
    // Έλεγχος υποχρεωτικών πεδίων
    if (!titlos || !perilipsi) {
      return res.status(400).json({ message: 'Ο τίτλος και η περίληψη είναι υποχρεωτικά πεδία' });
    }
    
    // Έλεγχος αν το θέμα ανήκει στον διδάσκοντα
    const existingThema = await collection.findOne({ 
      _id: new ObjectId(themaId),
      didaskontaId: didaskontaId 
    });
    
    if (!existingThema) {
      return res.status(404).json({ message: 'Το θέμα δεν βρέθηκε ή δεν έχετε δικαίωμα επεξεργασίας' });
    }
    
    // Έλεγχος αν το θέμα είναι ήδη ανατεθειμένο
    const diplomatikes = db.collection('diplomatikes');
    const diplomatiki = await diplomatikes.findOne({ themaId: themaId });
    
    if (diplomatiki) {
      return res.status(400).json({ message: 'Δεν μπορείτε να επεξεργαστείτε ένα θέμα που έχει ανατεθεί' });
    }
    
    // Δημιουργία αντικειμένου ενημέρωσης
    const updateDoc = {
      $set: {
        titlos,
        perilipsi,
        dateUpdated: new Date()
      }
    };
    
    // Αν υπάρχει PDF αρχείο, προσθήκη του path στο έγγραφο
    if (req.file) {
      // Διαγραφή προηγούμενου αρχείου αν υπάρχει
      if (existingThema.pdfPath) {
        fs.unlink(existingThema.pdfPath, (err) => {
          if (err) console.error('Σφάλμα κατά τη διαγραφή του αρχείου:', err);
        });
      }
      
      updateDoc.$set.pdfPath = req.file.path;
      updateDoc.$set.pdfFilename = req.file.filename;
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(themaId) },
      updateDoc
    );
    
    res.json({
      message: 'Το θέμα ενημερώθηκε επιτυχώς',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Σφάλμα κατά την επεξεργασία θέματος:', error);
    res.status(500).json({ message: 'Σφάλμα στον εξυπηρετητή' });
  } finally {
    await client.close();
  }
});

// Εκκίνηση του server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});