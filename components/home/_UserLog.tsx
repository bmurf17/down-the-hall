const testData = [
  {
    image:
      "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/590689_Yellowface.jpeg?alt=media&token=7b6287d0-6674-4d4d-844f-ea646b43cd3d",
    title: "Yellow Face",
    author: "Rebecca Kuang",
    action: "Finished Reading",
    statsMonth: "First Book this month",
    stasYear: "Fifth Book this Year",
  },
  {
    image:
      "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/590689_Yellowface.jpeg?alt=media&token=7b6287d0-6674-4d4d-844f-ea646b43cd3d",
    title: "Yellow Face",
    author: "Rebecca Kuang",
    action: "Finished Reading",
    statsMonth: "First Book this month",
    stasYear: "Fifth Book this Year",
  },
  {
    image:
      "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/590689_Yellowface.jpeg?alt=media&token=7b6287d0-6674-4d4d-844f-ea646b43cd3d",
    title: "Yellow Face",
    author: "Rebecca Kuang",
    action: "Finished Reading",
    statsMonth: "First Book this month",
    stasYear: "Fifth Book this Year",
  },
];

export default function UserLog() {
  return (
    <div className="flex flex-col gap-4">
      {testData.map((data, index) => {
        return (
          <div
            className="flex flex-col md:flex-row justify-between p-4 border-b-2 border-gray-500 hover:bg-slate-200 hover:cursor-pointer"
            key={data.title + index}
          >
            <div className="flex gap-4">
              <img
                className="relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
                src={data.image || ""}
                alt={data.title}
                height={100}
                width={100}
              />
              <div className="flex flex-col gap-2 justify-center">
                <div className="font-serif text-purple-600">{data.title}</div>
                <div className="text-md">By: {data.author}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <div>{data.stasYear}</div>
              <div>{data.statsMonth}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
