
import db from "../DB/db.js";

export const requireActiveCourseAccess = async (
    req,
    res,
    next
) => {
    const userId = req.auth?.userId;
    const courseSlug = req.params?.courseSlug;

    if (!userId || !courseSlug) {
        return res.status(403).json({
            success: false,
            code: "COURSE_ACCESS_DENIED",
            message: "Course access is unavailable.",
        });
    }

    try {
        const [rows] = await db.execute(
            `SELECT
                c.id,
                EXISTS (
                    SELECT 1
                    FROM course_enrollments ce
                    WHERE ce.user_id = ?
                      AND ce.course_id = c.id
                      AND ce.status IN (
                          'active', 'completed'
                      )
                      AND (
                          ce.access_source = 'legacy'
                          OR (
                              ce.access_source = 'stripe'
                              AND EXISTS (
                                  SELECT 1
                                  FROM course_subscriptions cs
                                  WHERE cs.user_id = ce.user_id
                                    AND cs.course_id = ce.course_id
                                    AND cs.status = 'active'
                                    AND cs.ended_at IS NULL
                                    AND cs.current_period_end >
                                        UTC_TIMESTAMP()
                              )
                          )
                      )
                ) AS has_access
             FROM courses c
             WHERE c.slug = ?
               AND c.is_active = 1
             LIMIT 1`,
            [userId, courseSlug]
        );

        // Preserve existing controller's 404 handling.
        if (!rows.length) {
            return next();
        }

        if (Number(rows[0].has_access) !== 1) {
            return res.status(403).json({
                success: false,
                code: "COURSE_SUBSCRIPTION_REQUIRED",
                message:
                    "An active course subscription is required.",
            });
        }

        return next();
    } catch (error) {
        console.error(
            "Course access middleware error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to verify course access.",
        });
    }
};
