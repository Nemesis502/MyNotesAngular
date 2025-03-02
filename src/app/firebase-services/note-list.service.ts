import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collectionData, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, limit, where, orderBy, DocumentData, QuerySnapshot } from '@angular/fire/firestore';
import { elementAt, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  firestore: Firestore = inject(Firestore);

  unsubNote;
  unsubTrash;
  unsubMarkedNotes;

  constructor() {
    this.unsubNote = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    this.unsubTrash = this.subTrashlist()
  }

  async deleteNote(colId: "notes" | "trash", docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => { console.error(err) }
    )
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromeNote(note), note.id)
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => { console.error(err); }
      );
    }
  }

  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  getColIdFromeNote(note: Note) {
    if (note.type == "note") {
      return "notes"
    } else {
      return "trash"
    }
  }

  async addNote(item: Note, colId: "note" | "trash") {
    if (colId == "note") {
      await addDoc(this.getNotesRef(), item).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => { console.log("Document written with ID: ", docRef?.id) }
      )
    } else {
      await addDoc(this.getTrashNotesRef(), item).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => { console.log("Document written with ID: ", docRef?.id) }
      )
    }
  }

  ngonDestroy() {
    this.unsubNote();
    this.unsubTrash();
    this.unsubMarkedNotes();
  }

  subTrashlist() {
    return onSnapshot(this.getTrashNotesRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  subNotesList() {
    // let ref = collection(this.firestore, "notes/116RW5dT2cGPEEg6BQts/notesExtra"); Für Test der Subcollection, ref als Variable bei getNotesRef() bei query(this.getNotesRef() einfügen.
    const q = query(this.getNotesRef(), limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      })
      this.changeLog(list)
    });
    
  }

  changeLog(list: QuerySnapshot<DocumentData, DocumentData>){
    list.docChanges().forEach((change) => {
      if (change.type === "added") {
          console.log("New note: ", change.doc.data());
      }
      if (change.type === "modified") {
          console.log("Modified note: ", change.doc.data());
      }
      if (change.type === "removed") {
          console.log("Removed note: ", change.doc.data());
      }
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      })
    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || "",
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashNotesRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId)
  }
}
