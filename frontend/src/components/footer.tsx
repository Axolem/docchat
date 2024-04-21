import { memo } from "react";

function Footer() {
	return (
		<footer className="flex flex-col bg-background py-3 text-center text-muted/70">
			<p className="text-sm">
				&copy; 2024 Doc Chat. All rights reserved. v1.2.0
			</p>
			<a
				target="_blank"
				href="https://www.freepik.com/free-photo/3d-rendering-zoom-call-avatar_29803186.htm#fromView=search&page=1&position=49&uuid=986f6156-9a4f-483a-bca0-47f2627964e4"
				rel="noreferrer"
				className="mx-auto max-w-fit text-center"
			>
				Image by freepik
			</a>
			<span>
				<a
					target="_blank"
					href="https://icons8.com/icon/SPJrDfRcvJLu/documents"
					rel="noreferrer"
				>
					Documents
				</a>{" "}
				icon by{" "}
				<a
					target="_blank"
					href="https://icons8.com"
					rel="noreferrer"
				>
					Icons8
				</a>
			</span>
		</footer>
	);
}

export default memo(Footer);
