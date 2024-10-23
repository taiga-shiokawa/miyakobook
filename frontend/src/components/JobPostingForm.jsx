import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import FormField from './FormField';
import { useEffect, useState } from 'react';

const JobPostingForm = () => {
  const navigate = useNavigate();
  const [jobInfo, setJobInfo] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    company: '',
    jobType: '',
    employmentType: '',
    requiredSkills: [],
    experienceLevel: '',
    educationLevel: '',
    applicationDeadline: '',
    jobUrl: ''
  });

  useEffect(() => {
    const storedCompanyInfo = localStorage.getItem('companyInfo');
    if (storedCompanyInfo) {
      const parsedCompanyInfo = JSON.parse(storedCompanyInfo);
      console.log('Retrieved company info:', parsedCompanyInfo); // デバッグ用ログ
      setJobInfo(prevState => ({
        ...prevState,
        company: parsedCompanyInfo._id // 会社のIDを設定
      }));
    } else {
      console.log('No company info found in localStorage'); // デバッグ用ログ
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobInfo({ ...jobInfo, [name]: value });
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setJobInfo({ ...jobInfo, requiredSkills: skills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting job info:', jobInfo); // デバッグ用ログ
      const response = await axiosInstance.post('/jobs/job-posting', jobInfo);
      console.log('求人情報登録成功:', response.data);
      navigate('/jobs');
    } catch (error) {
      console.error('求人情報登録エラー:', error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">求人情報を入力</h2>
        <form onSubmit={handleSubmit}>
          <FormField 
            label="求人タイトル" 
            type="text" 
            name="title"
            value={jobInfo.title} 
            onChange={handleChange}
            placeholder="求人のタイトルを入力してください"
          />
          <FormField 
            label="仕事内容" 
            type="textarea" 
            name="description"
            value={jobInfo.description} 
            onChange={handleChange}
            placeholder="仕事の詳細な内容を記述してください"
          />
          <FormField 
            label="勤務地" 
            type="text" 
            name="location"
            value={jobInfo.location} 
            onChange={handleChange}
            placeholder="勤務地を入力してください"
          />
          <FormField 
            label="給与" 
            type="text" 
            name="salary"
            value={jobInfo.salary} 
            onChange={handleChange}
            placeholder="給与情報を入力してください"
          />
          <FormField 
            label="雇用形態" 
            type="select" 
            name="employmentType"
            value={jobInfo.employmentType} 
            onChange={handleChange}
            options={[
              { value: '正社員', label: '正社員' },
              { value: '契約社員', label: '契約社員' },
              { value: 'パート・アルバイト', label: 'パート・アルバイト' },
              { value: '派遣社員', label: '派遣社員' },
              { value: 'その他', label: 'その他' }
            ]}
          />
          <FormField 
            label="職種タイプ" 
            type="select" 
            name="jobType"
            value={jobInfo.jobType} 
            onChange={handleChange}
            options={[
              { value: 'フルタイム', label: 'フルタイム' },
              { value: 'パートタイム', label: 'パートタイム' },
              { value: '契約社員', label: '契約社員' },
              { value: 'フリーランス', label: 'フリーランス' },
              { value: 'その他', label: 'その他' }
            ]}
          />
          <FormField 
            label="必要なスキル（カンマ区切り）" 
            type="text" 
            name="requiredSkills"
            value={jobInfo.requiredSkills.join(', ')} 
            onChange={handleSkillsChange}
            placeholder="例: JavaScript, React, Node.js"
          />
          <FormField 
            label="経験レベル" 
            type="select" 
            name="experienceLevel"
            value={jobInfo.experienceLevel} 
            onChange={handleChange}
            options={[
              { value: '新卒', label: '新卒' },
              { value: '1-3年', label: '1-3年' },
              { value: '3-5年', label: '3-5年' },
              { value: '5年以上', label: '5年以上' },
              { value: '不問', label: '不問' }
            ]}
          />
          <FormField 
            label="学歴" 
            type="select" 
            name="educationLevel"
            value={jobInfo.educationLevel} 
            onChange={handleChange}
            options={[
              { value: '高校卒', label: '高校卒' },
              { value: '専門学校卒', label: '専門学校卒' },
              { value: '大学卒', label: '大学卒' },
              { value: '大学院卒', label: '大学院卒' },
              { value: '不問', label: '不問' }
            ]}
          />
          <FormField 
            label="応募締切日" 
            type="date" 
            name="applicationDeadline"
            value={jobInfo.applicationDeadline} 
            onChange={handleChange}
          />
          <FormField 
            label="求人URL （電話番号、メールアドレスも可）" 
            type="text" 
            name="jobUrl"
            value={jobInfo.jobUrl} 
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-[#5fced8] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            求人を掲載
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm;