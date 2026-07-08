const db = require('../config/db');
const { Op } = require('sequelize');

// 获取本校用户发布的动态列表 (分页、搜索、筛选)
exports.getSchoolPosts = async (req, res) => {
  try {
    const schoolId = req.admin.schoolId;
    if (!schoolId) {
      return res.status(403).json({ success: false, message: '无权访问此学校的信息' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { search, status, visibility } = req.query;

    let postWhereClause = {};
    // For School Admin, always exclude private posts.
    postWhereClause.visibility = { [Op.ne]: 'private' }; 

    // If client sends a specific visibility filter (e.g. 'public', 'school'), 
    // it will AND with the above non-private condition.
    // This means school admins can filter by 'public' or 'school', but never 'private'.
    if (visibility && visibility !== 'private') { // Allow filtering by public or school
        postWhereClause.visibility = visibility; // This will overwrite the Op.ne if it's 'public' or 'school'
                                              // but if visibility is 'private', Op.ne still applies if not careful
                                              // Let's refine this logic to be clearer
    }

    // Refined logic: Start with excluding private, then add other visibility if specified
    postWhereClause.visibility = { [Op.ne]: 'private' };
    if (visibility && visibility !== 'private') {
        // If school admin specifically filters for public or school, we respect that.
        // The { [Op.ne]: 'private' } will still be part of the query due to initial assignment.
        // To combine, we can use Op.and if necessary, or simply let the specific filter override if it's not 'private'.
        // Correct approach: Combine with AND or ensure the new filter doesn't conflict.
        postWhereClause = {
            ...postWhereClause,
            visibility: visibility, // This means if visibility is 'public', it becomes 'public' and implicitly not 'private'
                                  // if visibility is 'school', it becomes 'school' and implicitly not 'private'
        };
    } else if (visibility === 'private') {
        // School admin explicitly tries to filter for private. We must deny this.
        // So we keep the original { [Op.ne]: 'private' } and do not change postWhereClause.visibility
        // Or, more explicitly, we could return an empty set or an error, but for now, just don't show them.
    }
    // Simpler logic: School admin can filter by public or school. If no filter, show public and school.
    // Private is always excluded for school admins.
    if (visibility && (visibility === 'public' || visibility === 'school')) {
        postWhereClause.visibility = visibility;
    } else {
        // Default for school admin: show public AND school, exclude private
        postWhereClause.visibility = { [Op.in]: ['public', 'school'] };
    }

    let userWhereClause = { school_id: schoolId }; // Always filter by the admin's school

    if (status) {
      postWhereClause.status = status;
    }
    // The visibility assignment is already handled above
    // if (visibility) {
    //   postWhereClause.visibility = visibility;
    // }

    const includeOptions = [
      {
        model: db.User,
        as: 'user',
        attributes: ['user_id', 'username', 'real_name', 'avatar_url'],
        where: userWhereClause, // Apply school_id filter here
        required: true // Ensures only posts from users of this school are returned (INNER JOIN behavior)
      },
      {
        model: db.PostMedia,
        as: 'media',
        attributes: ['media_id', 'media_type', 'media_url', 'thumbnail_url'],
        required: false // LEFT JOIN to include posts even if they have no media
      }
    ];

    if (search) {
      postWhereClause[Op.or] = [
        { content: { [Op.like]: `%${search}%` } },
        // To search by username, Sequelize needs a more complex setup for searching on included models,
        // or we can fetch and filter in JS, or adjust the query structure.
        // For now, let's keep search on post content.
        // If searching on username is critical, we can add `$user.username$: { [Op.like]: ... }`
        // but this requires specific Sequelize configuration or direct use of Op.col for associations.
      ];
      // A common way to search on associated model fields:
      // includeOptions[0].where[Op.or] = [
      //   { username: { [Op.like]: `%${search}%` } }, 
      //   { real_name: { [Op.like]: `%${search}%` } }
      // ];
      // However, this would conflict if userWhereClause already has school_id. Let's adjust.

      // Refined search: search content OR user's username/real_name
      const searchCondition = { [Op.like]: `%${search}%` };
      postWhereClause[Op.or] = [
        { content: searchCondition },
        { '$user.username$': searchCondition }, // Note: $...$ syntax for associated columns
        { '$user.real_name$': searchCondition }
      ];
    }


    const queryOptions = {
      where: postWhereClause,
      include: includeOptions,
      limit: pageSize,
      offset: offset,
      order: [['created_at', 'DESC']],
      distinct: true, // Important for count when using includes with limits
      // subQuery: false, // May be needed depending on how complex the query becomes with search on associations
    };

    const { count, rows } = await db.Post.findAndCountAll(queryOptions);

    res.json({
      success: true,
      data: {
        posts: rows,
        total: count, // This count might be an object if group is used, ensure it's the total number of posts
        currentPage: page,
        totalPages: Math.ceil(count / pageSize),
      },
    });

  } catch (error) {
    console.error('获取学校动态列表失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};

// 更新动态状态
exports.updatePostStatus = async (req, res) => {
  try {
    const schoolId = req.admin.schoolId;
    const { postId } = req.params;
    const { status } = req.body; // Expected status: 'active', 'hidden', 'deleted'

    if (!status || !['active', 'hidden', 'deleted'].includes(status)) {
      return res.status(400).json({ success: false, message: '无效的状态值' });
    }

    const post = await db.Post.findOne({
      where: { post_id: postId },
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['school_id'], // Only need school_id for validation
        where: { school_id: schoolId }, // Ensure the post belongs to a user from the admin's school
        required: true
      }]
    });

    if (!post) {
      return res.status(404).json({ success: false, message: '动态不存在或无权限操作' });
    }

    await post.update({ status: status });

    res.json({ success: true, message: `动态状态已更新为 ${status}`, data: post });

  } catch (error) {
    console.error('更新动态状态失败:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ success: false, message: '操作失败，可能存在关联数据问题。' });
    }
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};

// TODO: Implement other post management functions:
// exports.getPostDetails = async (req, res) => { ... }; 