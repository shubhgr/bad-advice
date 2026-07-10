import { Course } from "@/lib/types";

interface RecommendationCardProps {
  course: Course;
}

export default function RecommendationCard({ course }: RecommendationCardProps) {
  return (
    <article className="recommendation-card">
      <h3 className="recommendation-card-title">{course.courseName}</h3>

      <div className="recommendation-card-details">
        <div className="recommendation-detail-row">
          <span>Course Duration</span>
          <strong>{course.duration}</strong>
        </div>
        <div className="recommendation-detail-row">
          <span>Accreditation</span>
          <strong>{course.accreditation}</strong>
        </div>
        <div className="recommendation-detail-row">
          <span>Total Fees</span>
          <strong>{course.totalFees}</strong>
        </div>
      </div>

      <a
        href={course.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="recommendation-card-cta"
      >
        Apply / Learn More
      </a>
    </article>
  );
}
