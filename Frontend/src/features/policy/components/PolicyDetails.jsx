import { useState, useEffect, useContext, Suspense, lazy } from "react";
import { timeFormat } from "../../../utils/timeFormat";
import { AuthContext } from "../../../context/AuthContext";
const MDEditor = lazy(() => import("@uiw/react-md-editor"));
import Markdown from "react-markdown";
import { Button } from "../../../components/ui/Button";
import { FaRegEdit, FaSave, FaCheck, FaArchive, FaFileAlt } from "react-icons/fa";
import { Input } from "../../../components/ui/Input";
import ModalButton from "../../../components/ui/ModalButton";
import { RxCross2 } from "react-icons/rx";
import { IoWarning, IoReload } from "react-icons/io5";
import { MdBlock } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const PolicyDetails = ({ policy, onUpdate, onCreate, isCreate = false, updateLoading, policyError, setPolicyError }) => {
	const [editDesc, setEditDesc] = useState(policy?.description || "");
	const [editTitle, setEditTitle] = useState(policy?.title || "");

	const { canManage } = useContext(AuthContext);
	const navigate = useNavigate();

	const [isEdit, setIsEdit] = useState(isCreate);

	useEffect(() => {
		setEditDesc(policy?.description || "");
		setEditTitle(policy?.title || "");
	}, [policy]);

	if (!policy && !isCreate) {
		return <div>Lỗi khi tải chính sách (không tìm thấy)</div>;
	}

	const id = policy?.id;
	const title = policy?.title || "";
	const createdAt = policy?.createdAt;
	const updatedAt = policy?.updatedAt;
	const description = policy?.description || "";
	const status = policy?.status || "DRAFT";
    
	const hasChanged = editDesc !== description || editTitle !== title;

	const handleSave = async (newStatus) => {
		if (isCreate) {
			const newPolicy = await onCreate({ title: editTitle, description: editDesc, status: newStatus });
			if (newPolicy && newPolicy.id) {
				navigate(`/policy`);
			}
		} else {
			await onUpdate(id, { title: editTitle, description: editDesc, status: newStatus });
			setIsEdit(false);
		}
	};

	const handleDiscard = () => {
		if (isCreate) {
			navigate(-1);
		} else {
			setEditDesc(description);
			setEditTitle(title);
			setIsEdit(false);
            if (setPolicyError) setPolicyError("");
		}
	};

	return (
		<>
            {policyError && (
                <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-red-500 text-white mb-4">
                    <MdBlock className="text-xl shrink-0" />
                    <p>{policyError}</p>
                </div>
            )}
			{canManage && (
				<div className="flex gap-2 flex-wrap mb-3">
					{!isEdit && (
						<Button
							className="bg-blue-400 hover:bg-blue-500 flex items-center gap-1"
							onClick={() => setIsEdit(true)}
						>
							<FaRegEdit className="text-sm" /> <span>Sửa</span>
						</Button>
					)}

					{isEdit && (
						<>
							<Button
								onClick={() => handleSave("DRAFT")}
								className="bg-gray-500 hover:bg-gray-600 flex items-center gap-1 text-white"
								disabled={updateLoading}
							>
								{updateLoading ? <IoReload className="animate-spin" /> : <FaFileAlt className="text-sm" />}
								<span>Lưu bản nháp</span>
							</Button>

							{hasChanged && (
								<Button
									onClick={() => handleSave("PUBLISHED")}
									className="bg-green-500 hover:bg-green-600 flex items-center gap-1 text-white"
									disabled={updateLoading}
								>
									{updateLoading ? <IoReload className="animate-spin" /> : <FaSave className="text-sm" />}
									<span>Xuất bản</span>
								</Button>
							)}

							<Button
								onClick={handleDiscard}
								className="bg-red-500 hover:bg-red-600 flex items-center gap-1 text-white"
								disabled={updateLoading}
							>
								<RxCross2 className="text-sm" />
								<span>Hủy</span>
							</Button>
						</>
					)}

					{!isEdit && status !== "ARCHIVED" && (
						<ModalButton
							buttonClasses="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1 text-white"
							buttonLabel={<><FaArchive className="text-sm" /><span>Lưu trữ</span></>}
							modalTitle={<div className="flex gap-2 items-center"><IoWarning className="text-2xl" /><p>Lưu ý</p></div>}
						>
							{({ close }) => (
								<>
									<p>Bạn có chắc chắn muốn lưu trữ chính sách này? Nó sẽ không còn hiển thị cho người dùng.</p>
									<div className="flex gap-2 mt-3">
										<Button
											onClick={async () => {
												await handleSave("ARCHIVED");
												close();
											}}
											className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1"
										>
											<FaCheck className="text-xs" /> Có
										</Button>
										<Button onClick={() => close()} className="bg-gray-500 hover:bg-gray-600 flex items-center gap-1">
											<RxCross2 /> Không
										</Button>
									</div>
								</>
							)}
						</ModalButton>
					)}
				</div>
			)}
			
			{canManage && isEdit ? (
				<>
					<h3 className="my-1">Tiêu đề:</h3>
					<Input
						placeholder={"Chỉnh sửa tiêu đề..."}
						type="text"
						onChange={(e) => {
                            setEditTitle(e.target.value);
                            if (setPolicyError) setPolicyError("");
                        }}
						defaultValue={editTitle}
					></Input>

					<h2 className="mt-3 mb-1">Nội dung:</h2>
					<div data-color-mode="light" className="container">
						<Suspense fallback={<div className="p-4 border rounded">Đang tải trình chỉnh sửa...</div>}>
							<MDEditor
								className="min-h-80"
								value={editDesc}
								onChange={setEditDesc}
							/>
						</Suspense>
					</div>
				</>
			) : (
				<>
					<div>
						<h1 className="text-2xl flex items-center gap-2">
							#{id} - {title}
							{status === "DRAFT" && <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">Bản nháp</span>}
							{status === "ARCHIVED" && <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Lưu trữ</span>}
						</h1>
						<span className="text-gray-500 text-sm">
							Ngày tạo: {timeFormat(createdAt)} - Ngày sửa:{" "}
							{timeFormat(updatedAt)}
						</span>
					</div>

					<div className="prose max-w-none w-full rounded-lg mt-6	mb-15">
						<Markdown 
							components={{ 
								hr: () => <hr className="my-6 border-t-2 border-gray-300" />,
								h1: ({...props}) => <h1 className="border-b border-gray-300 pb-2" {...props} />,
								h2: ({...props}) => <h2 className="border-b border-gray-300 pb-2" {...props} />
							}}
						>
							{editDesc}
						</Markdown>
					</div>
				</>
			)}
		</>
	);
};

export default PolicyDetails;
