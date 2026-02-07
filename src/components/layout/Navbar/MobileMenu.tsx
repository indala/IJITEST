import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { navigation } from './nav-data';

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                >
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {navigation.map((item) => (
                            <div key={item.name}>
                                <Link
                                    href={item.href}
                                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                                {item.children && (
                                    <div className="pl-6 space-y-1">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className="block px-3 py-1 text-sm text-gray-500 hover:text-primary"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="pt-4">
                            <Link
                                href="/submit"
                                className="block w-full bg-primary text-white py-4 text-center rounded-xl font-black uppercase tracking-widest text-xs"
                                onClick={() => setIsOpen(false)}
                            >
                                Submit Paper
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
