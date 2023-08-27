import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

export function PrimaryLinkButton(props: LinkProps & {children: ReactNode; className?: string}) {
    return <Link {...props} className={clsx("rounded px-4 py-2 bg-blue-400 hover:bg-blue-500", props.className ?? "")}>{props.children}</Link>
}
