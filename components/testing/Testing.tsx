"use client";
import "./Testing.css";

export default function Testing() {
  return (
    <div className="outside">
      <div className="book-wrapper">
        <div className="card">
          <div className="cover shadow">
            <img
              className="shadow"
              src="https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/665261_Wind%20and%20Truth.jpeg?alt=media&token=56b3b36b-0a65-4410-8aa1-87bb145e9700"
              alt="winds-and-truth"
            />
          </div>
          <div className="content">
            <h3 className="text-2xl font-bold">Wind and Truth</h3>
            <p>
              The long-awaited explosive climax to the first arc of the #1 New
              York Times bestselling Stormlight Archive. Dalinar Kholin has
              challenged the evil god Odium to a contest of champions, and the
              Knights Radiant and the nations of Roshar have a mere 10 days to
              prepare for the worst. The fate of the entire world―and the
              Cosmere at large―hangs in the balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
