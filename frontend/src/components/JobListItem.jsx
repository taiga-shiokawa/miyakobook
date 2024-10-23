import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const JobListItem = ({ job, authUser, onSelect }) => {

  const isOwner = authUser._id === job.author._id;

  const queryClient = useQueryClient();

  const { mutate: deleteJob, isPending: isDeletingJob } = useMutation({
		mutationFn: async () => {
			await axiosInstance.delete(`/jobs/delete/${job._id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
			toast.success("求人を削除しました");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

  const handleDeleteJob = (e) => {
    e.stopPropagation();
		if (!window.confirm("求人を削除してもよろしいですか?")) return;
		deleteJob();
	};

  return (
    <div 
      key={job._id}
      className="border p-4 mb-4 cursor-pointer hover:bg-gray-100 relative"
      onClick={onSelect}
    >
      {isOwner && (
        <button 
          onClick={handleDeleteJob} 
          className="absolute top-2 right-2 p-2 hover:bg-gray-200 rounded-full text-red-500 hover:text-red-700"
        >
          {isDeletingJob ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      )}
      <h3 className="text-xl font-semibold pr-8">{job.title}</h3>
      <p>{job.company?.name}</p>
      <p>{job.location}</p>
      <p className="font-bold">{job.salary}</p>
    </div>
  );
};

export default JobListItem;