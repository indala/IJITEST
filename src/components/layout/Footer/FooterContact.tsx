import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterContactProps {
    email: string;
    phone: string;
    address: string;
}

export function FooterContact({ email, phone, address }: FooterContactProps) {
    return (
        <div>
            <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em] opacity-40">Support HQ</h4>
            <ul className="space-y-6 text-sm">
                <li className="flex items-start space-x-4">
                    <div className="p-2.5 bg-white/5 rounded-xl text-secondary shrink-0">
                        <Mail className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Editorial Email</p>
                        <p className="text-white font-bold">{email}</p>
                    </div>
                </li>
                <li className="flex items-start space-x-4">
                    <div className="p-2.5 bg-white/5 rounded-xl text-emerald-500 shrink-0">
                        <Phone className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Direct Line</p>
                        <p className="text-white font-bold">{phone}</p>
                    </div>
                </li>
                <li className="flex items-start space-x-4">
                    <div className="p-2.5 bg-white/5 rounded-xl text-amber-500 shrink-0">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-xs leading-relaxed font-medium">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Office Location</p>
                        <p className="text-white/80 italic">{address}</p>
                    </div>
                </li>
            </ul>
        </div>
    );
}
