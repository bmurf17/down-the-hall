export enum Status {
  InProgress,
  Finished,
  WantToStart,
  DidNotFinish,
}

export const readingStatusString: string[] = [
  "Reading",
  "Read",
  "TBR",
  "DNF",
  "Add To List",
];

export const logStatusString: string[] = [
  "Started Reading",
  "Finished Reading",
  "Want to Read",
  "Did Not Finish",
];
