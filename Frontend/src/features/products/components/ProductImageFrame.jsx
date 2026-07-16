/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-09
 * Last Modified: 2026-07-15
 */
import { useState } from "react";
import { cn } from "../../../utils/cn";

export default function ProductImageFrame({
	src,
	alt = "Sản phẩm",
	className,
	imageClassName,
	fallbackLabel = "Chưa có ảnh hiển thị",
}) {
	const [failedSrc, setFailedSrc] = useState("");

	// Store the exact failed src so changing to a new image automatically clears the fallback state.
	const shouldShowImage = Boolean(src) && failedSrc !== src;

	return (
		<div
			className={cn(
				"flex items-center justify-center overflow-hidden rounded-2xl border border-black/20 bg-green-200/40 text-sm text-green-600",
				className,
			)}
		>
			{shouldShowImage ? (
				<img
					src={src}
					alt={alt}
					className={cn("h-full w-full object-cover", imageClassName)}
					loading="lazy"
					onError={() => setFailedSrc(src)}
				/>
			) : (
				<div className="grid h-full w-full place-items-center px-4 text-center">
					<div>
						<div className="text-4xl">🌿</div>
						<p className="mt-2">{fallbackLabel}</p>
					</div>
				</div>
			)}
		</div>
	);
}
