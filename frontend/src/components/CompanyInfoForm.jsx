import { useState } from 'react';
import FormField from './FormField';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';

const CompanyInfoForm = () => {
  const navigate = useNavigate();
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    industry: '',
    employeeCount: '',
    address: '',
    phoneNumber: '',
    email: '',
  });

  const handleChange = (e) => {
    setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/jobs/company-info', companyInfo);
      console.log('企業情報登録成功:', response.data);
      // 企業情報をローカルストレージに保存（JobPostingFormで使用するため）
      localStorage.setItem('companyInfo', JSON.stringify(response.data.company));
      // JobPostingFormに遷移
      navigate('/job-posting');
    } catch (error) {
      console.error('企業情報登録エラー:', error);
      // エラーハンドリング（エラーメッセージの表示など）
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">企業情報を入力</h2>
        <form onSubmit={handleSubmit}>
          <FormField 
            label="会社名" 
            type="text" 
            placeholder="株式会社〇〇" 
            value={companyInfo.name} 
            onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } })}
          />
          <FormField 
            label="業種" 
            type="text" 
            placeholder="IT・通信" 
            value={companyInfo.industry} 
            onChange={(e) => handleChange({ target: { name: 'industry', value: e.target.value } })}
          />
          <FormField 
            label="従業員数" 
            type="number" 
            placeholder="100" 
            value={companyInfo.employeeCount} 
            onChange={(e) => handleChange({ target: { name: 'employeeCount', value: e.target.value } })}
          />
          <FormField 
            label="住所" 
            type="text" 
            placeholder="東京都渋谷区..." 
            value={companyInfo.address} 
            onChange={(e) => handleChange({ target: { name: 'address', value: e.target.value } })}
          />
          <FormField 
            label="電話番号" 
            type="tel" 
            placeholder="03-1234-5678" 
            value={companyInfo.phoneNumber} 
            onChange={(e) => handleChange({ target: { name: 'phoneNumber', value: e.target.value } })}
          />
          <FormField 
            label="メールアドレス" 
            type="email" 
            placeholder="info@example.com" 
            value={companyInfo.email} 
            onChange={(e) => handleChange({ target: { name: 'email', value: e.target.value } })}
          />
          <button
            type="submit"
            className="w-full bg-[#5fced8] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            登録
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          企業情報登録には制限が適用される場合があります。
          <a href="#" className="text-blue-500 hover:text-blue-700">ポリシーを表示</a>
        </p>
      </div>
    </div>
  );
};

export default CompanyInfoForm;