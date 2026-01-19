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
              <div className="flex flex-col md:flex-row gap-2 align-middle flex-1 min-w-0">
                <div className="flex justify-center flex-shrink-0">
                  <img
                    className="w-20 md:w-28 relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
                    src={book?.image || ""}
                    alt={book?.title}
                    height={100}
                    width={100}
                  />
                </div>
                <div className="flex flex-col gap-2 flex-grow min-w-0">
                  <div className="text-base md:text-lg font-semibold">
                    {data.userActivity.action}
                  </div>
                  <div className="text-lg md:text-xl font-serif text-purple-600 break-words">
                    {book?.title}
                  </div>
                  <div className="text-sm md:text-base font-semibold text-text">
                    By: {data.authorDetails.name}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}