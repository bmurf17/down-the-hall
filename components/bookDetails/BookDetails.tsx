import { BookItem } from '@/types/googlebookresponse';

interface Props {
  bookInfo: BookItem;
}

export default function BookDetails({ bookInfo }: Props) {
  return (
    <div  style={{ minHeight: "calc(100vh - 101px)" }}>
      <div className='relative h-80' style={{ marginTop: '-64px', paddingTop: '64px' }}>
        <div
          className='absolute top-0 bg-repeat bg-top w-full lg:h-[500px]'
          style={{
            backgroundImage: `url(${'https://cdn.hardcover.app/enlarge?url=https://storage.googleapis.com/hardcover/images/bookHeaders/fiction.webp&width=2448&height=496&type=webp'})`,
            width: '100%',
            height: '100%',
          }}>
          <div className='bg-gradient-to-b from-transparent to-white dark:to-gray-800 h-full flex flex-col justify-end items-center lg:from-50% lg:to-100% to-90%'>
            <div className='lg:hidden'>
              <div className='relative overflow-hidden group transition-all rounded-l-sm rounded-r-md border border-secondary'></div>
            </div>
            <div className='relative px-2 lg:px-0 lg:pt-8 mt-[180px] lg:mt-[80px]'>
              <div className='mx-auto px-2 lg:px-0 my-2 max-w-3xl lg:h-0'>
                <div className='flex flex-row'>
                  <div className='hidden lg:block mr-4 flex-none'>
                    <div className=' relative overflow-hidden group transition-all rounded-l-sm rounded-r-md border border-secondary '>
                      <img
                        src={bookInfo.volumeInfo.imageLinks.thumbnail}
                        alt='Yellowface'
                        width='180'
                        height='271'
                        loading='lazy'
                      />
                    </div>
                  </div>

                  <div className='flex-grow flex flex-col justify-between'>
                    <div>
                      <div className='mt-4'>
                        <h1 className='font-serif text-gray-800 dark:text-gray-200 mb-1 text-3xl lg:text-5xl'>
                          {bookInfo.volumeInfo.title}
                        </h1>
                        <div className='mt-2 lg:mt-0'>
                          <div className='font-semibold text-sm hidden lg:flex'>
                            <div className='flex-inline flex-row flex-wrap leading-5'>
                              <span className='text-md mr-1'>By</span>

                              <span className='flex-inline flex-row mr-1'>
                                {/* <div className='overflow-hidden border border-gray-700 dark:border-gray-50 rounded-full inline-block mr-1 align-middle w-5 h-5'>
                                  <img
                                    src='https://cdn.hardcover.app/enlarge?url=https://storage.googleapis.com/hardcover/authors/195360/8539488-L.jpg&amp;width=20&amp;height=20&amp;type=webp'
                                    alt='R.F. Kuang'
                                    width='20'
                                    height='20'
                                    loading='eager'
                                    style={{
                                      backgroundImage: `url(${'https://storage.googleapis.com/hardcover/images/people/profilePics/profilePic1.png'})`,
                                    }}
                                    className='avatar cursor-pointer object-cover bg-cover w-full h-full hover:opacity-80 group-hover:opacity-80  transition-all'
                                  />
                                </div> */}

                                <span className='ml-1'>{bookInfo.volumeInfo.authors[0]}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col col-span-4 lg:col-span-2'>
                      <div className='hidden lg:block'>Button</div>
                      <div>
                        <div className='mt-3 mb-2 flex justify-between'>
                          <span className='text-gray-600 dark:text-gray-400 text-sm font-semibold'>
                            2023 • 336 Pages
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
      <div className='mx-auto px-2 lg:px-0 my-4 max-w-3xl lg:mt-72'>
        {bookInfo.volumeInfo.description}
      </div>

    </div>
  );
}
