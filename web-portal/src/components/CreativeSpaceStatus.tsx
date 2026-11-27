
import type { CreativeSpaceStatus as CreativeSpaceStatusType } from "@/types/creative-space";

interface CreativeSpaceStatusProps {
  status: CreativeSpaceStatusType;
}

export default function CreativeSpaceStatus({
  status,
}: CreativeSpaceStatusProps) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
    </span>
  );
}
