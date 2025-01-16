import { UserActivityLogList } from "@/types/apiResponse/UseLogResponse";

interface Props {
  activityLog: UserActivityLogList;
}

export default function ActivityLog({ activityLog }: Props) {
  return (
    <>
      <div className="flex flex-col gap-4">
        {activityLog.map((data, index) => {
          const book = data.bookDetails;
          return (
            <div
              className="flex flex-col md:flex-row justify-between p-4 border-b-2 border-gray-500 hover:bg-slate-200 hover:cursor-pointer"
              key={book?.title || "" + index}
            >
              <div className="flex gap-4">
                <img
                  className="relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
                  src={book?.image || ""}
                  alt={book?.title}
                  height={100}
                  width={100}
                />
                <div className="flex flex-col gap-2 justify-center">
                  <div className="text-lg">{data.userActivity.action}</div>
                  <div className="font-serif text-purple-600">
                    {book?.title}
                  </div>
                  <div className="text-md">By: {data.authorDetails.name}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
