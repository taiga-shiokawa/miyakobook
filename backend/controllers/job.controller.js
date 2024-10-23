import Company from "../models/company.model.js";
import Job from "../models/job.model.js";

export const companyInfoPosting = async (req, res) => {
  try {
    const { name, industry, employeeCount, address, phoneNumber, email } = req.body;

    // 既存の会社を確認
    let company = await Company.findOne({ email });

    if (company) {
      // 既存の会社情報を更新
      company.name = name;
      company.industry = industry;
      company.employeeCount = employeeCount;
      company.address = address;
      company.phoneNumber = phoneNumber;
      await company.save();
    } else {
      // 新しい会社を作成
      company = new Company({
        author: req.user._id,
        name,
        industry,
        employeeCount,
        address,
        phoneNumber,
        email
      });
      await company.save();
    }

    res.status(201).json({
      success: true,
      message: '会社情報が正常に保存されました',
      company
    });
  } catch (error) {
    console.error('会社情報の保存中にエラーが発生しました:', error);
    res.status(500).json({
      success: false,
      message: '会社情報の保存中にエラーが発生しました'
    });
  };
}

export const jobInfoPosting = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      salary,
      company,
      jobType,
      employmentType,
      requiredSkills,
      experienceLevel,
      educationLevel,
      applicationDeadline,
      jobUrl
    } = req.body;

    // 会社の存在確認
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: '指定された会社が見つかりません'
      });
    }

    // 新しい求人を作成
    const job = new Job({
      author: req.user._id,
      title,
      description,
      location,
      salary,
      company,
      jobType,
      employmentType,
      requiredSkills,
      experienceLevel,
      educationLevel,
      applicationDeadline: new Date(applicationDeadline),
      jobUrl
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: '求人情報が正常に保存されました',
      job
    });
  } catch (error) {
    console.error('求人情報の保存中にエラーが発生しました:', error);
    res.status(500).json({
      success: false,
      message: '求人情報の保存中にエラーが発生しました'
    });
  }
};

export const getJobs = async (req, res) => {
  try {
    // クエリパラメータからページネーション情報を取得
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 求人情報を取得し、関連する会社情報もポピュレート
    const jobs = await Job.find()
      .populate('company', 'name industry') // 会社名と業種のみをポピュレート
      .populate('author', 'name username profilePicture') 
      .sort({ createdAt: -1 }) // 新しい順にソート
      .skip(skip)
      .limit(limit);

    // 全求人数を取得（ページネーション用）
    const total = await Job.countDocuments();

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    console.error('求人情報の取得中にエラーが発生しました:', error);
    res.status(500).json({
      success: false,
      message: '求人情報の取得中にエラーが発生しました',
      error: error.message
    });
  }
}

export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    const job = await Job.findById(jobId);

    // 削除する求人の存在確認
    if (!job) {
      return res.status(404).json({ message: "投稿が見つかりません。" });
    }

    // 自分の求人 or 管理者であるか確認 todo: 管理者であるケースは未実装
    if (job.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "あなたにはこの投稿の削除権限がありません。" });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({ message: "求人を削除しました" });
  } catch (error) {
    console.error("求人の削除に失敗しました: ", error);
    res.status(500).json({ message: "サーバーエラーの可能性あり。" });
  }
}