import { useEffect, useState } from "react";
import RecruitmentSection from "../components/RecruitmentSection";
import { axiosInstance } from "../lib/axios";
import { useQuery } from "@tanstack/react-query";
import JobListItem from "../components/JobListItem";
import { ChevronLeft } from "lucide-react"; // 戻るボタン用のアイコン

const fetchJobs = async () => {
  const response = await axiosInstance.get("/jobs");
  return response.data;
};

const JobPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs
  });

  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetail, setShowJobDetail] = useState(false);

  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      setSelectedJob(data.data[0]);
    }
  }, [data]);

  // 求人選択時の処理
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    // モバイルビューの場合、詳細画面を表示
    setShowJobDetail(true);
  };

  // 戻るボタンの処理
  const handleBack = () => {
    setShowJobDetail(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching jobs</div>;

  const jobListings = data && data.data ? data.data : [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* 求人一覧 - モバイルでは詳細表示時に非表示 */}
      <div className={`w-full md:w-1/2 bg-secondary p-4 rounded-lg shadow 
        ${showJobDetail ? 'hidden md:block' : 'block'}`}>
        <RecruitmentSection />
        <div className="flex mb-4">
          <h2 className="text-2xl font-bold">求人一覧</h2>
        </div>
        {jobListings.length > 0 ? (
          <div className="space-y-4">
            {jobListings.map(job => (
              <JobListItem
                key={job._id}
                job={job}
                authUser={authUser}
                onSelect={() => handleJobSelect(job)}
              />
            ))}
          </div>
        ) : (
          <p>求人が見つかりません</p>
        )}
      </div>

      {/* 求人詳細 - モバイルでは選択時のみ表示 */}
      {selectedJob && (
        <div className={`w-full md:w-1/2 bg-secondary p-4 rounded-lg shadow 
          ${showJobDetail ? 'block' : 'hidden md:block'}`}>
          {/* 戻るボタン - モバイルでのみ表示 */}
          <button
            onClick={handleBack}
            className="md:hidden flex items-center text-gray-600 mb-4"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>求人一覧に戻る</span>
          </button>

          <h2 className="text-2xl font-bold mb-4">{selectedJob.title}</h2>
          <h3 className="text-xl mb-2">{selectedJob.company.name}</h3>
          <p className="mb-2">{selectedJob.location}</p>
          <p className="font-bold mb-4">{selectedJob.salary}</p>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
              {selectedJob.jobType}
            </span>
            <span className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
              {selectedJob.employmentType}
            </span>
          </div>
          <a 
            href={selectedJob.jobUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#5fced8] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            応募する
          </a>
          <div className="space-y-4">
            <section>
              <h4 className="text-lg font-semibold mb-2">仕事内容</h4>
              <p className="whitespace-pre-line">{selectedJob.description}</p>
            </section>
            <section>
              <h4 className="text-lg font-semibold mb-2">必要なスキル</h4>
              <ul className="list-disc list-inside">
                {selectedJob.requiredSkills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4 className="text-lg font-semibold mb-2">その他の情報</h4>
              <div className="space-y-2">
                <p>経験レベル: {selectedJob.experienceLevel}</p>
                <p>学歴: {selectedJob.educationLevel}</p>
                <p>応募締切: {new Date(selectedJob.applicationDeadline).toLocaleDateString()}</p>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobPage;