import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-16 font-[family-name:var(--font-geist-sans)] bg-yellow-50">

      <div className="items-center justify-items-center">
        <p className="text-5xl font-bold">Convert video to text for free!</p>
        <p>High accuracy and 200+ languages</p>
      </div>
      <div className="flex flex-col lg:flex-row w-full lg:w-[960px] lg:h-[500px] h-[700px]">
        <div className="flex flex-col items-center justify-center bg-white w-full lg:w-1/2 lg:mr-5 h-1/2 lg:h-full mb-5 lg:mt-0 rounded-3xl gap-5">
          <p>Drop or upload a file</p>
          <button className="text-white bg-blue-500 p-3 rounded-full w-[150px] cursor-pointer hover:bg-blue-400">Upload</button>
        </div>
        <div className="flex flex-col items-center justify-center bg-white w-full lg:w-1/2 lg:ml-5 h-1/2 lg:h-full mt-5 lg:mt-0 rounded-3xl gap-5">
          <p>Link</p>
        </div>
      </div>
    </div>
  );
}