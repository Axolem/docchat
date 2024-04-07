import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bug, Copy, Forward } from 'lucide-react';
import { cn } from '@/lib/utils';
import aiImage from "@/assest/img/ai-profile.jpg"
import Image from 'next/image';
import { toast } from 'sonner';

const Message = ({
    text,
    author,
    uid
}: {
    text: string;
    author: "user" | "system";
    id: string;
    uid: string;
}) => {
    return (
        <div className="flex px-4 md:px-6">
            <Avatar className="m-3">
                <AvatarFallback>
                    <Image src={author === "system" ? aiImage : `https://picsum.photos/seed/${uid}/200/200`} alt={`${author}profile image`} width={200} height={200}
                        objectFit='cover'
                    />
                </AvatarFallback>
            </Avatar>
            <div

                className={cn("flex flex-col gap-1 p-1 md:p-3 rounded-lg my-2",
                    author === "user" ? "shadow-2xl" : "",
                )}

            >
                <h4 className="scroll-m-20 text-base font-semibold tracking-tight">
                    {author === "system" ? "Doc Chat" : "You"}
                </h4>
                <p className="text-pretty text-base leading-7 [&:not(:first-child)]:mt-0 md:[&:not(:first-child)]:mt-2">{text}</p>
                <Toolbar text={text} />
            </div>
        </div>
    );
};

export default Message;


const Toolbar = ({ text }: { text: string }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        toast("Copied to clipboard")
    }

    const handleShare = () => {
        navigator.share({ text })
    }

    const handleReport = () => {
        // TODO! Implement a report feature
        alert("Feature not implemented yet!")
    }
    return (
        <div className="mx-auto flex w-min justify-center gap-4">
            <Copy className="h-4 w-4 cursor-pointer hover:h-5 hover:w-5 hover:text-primary/70 active:text-secondary" onClick={handleCopy} />
            <Forward className="h-4 w-4 cursor-pointer hover:h-5 hover:w-5 hover:text-primary/70 active:text-secondary" onClick={handleShare} />
            <Bug className="h-4 w-4 cursor-pointer hover:h-5 hover:w-5 hover:text-primary/70 active:text-secondary" onClick={handleReport} />
        </div>
    )
}