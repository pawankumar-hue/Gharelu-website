import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Search, RefreshCw, MapPin } from 'lucide-react';
import { adminApi } from './adminApi';
import type { User } from './types';
import { SectionTitle, Empty } from './ui';

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      setUsers(res.users);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const vegCount = users.filter((u) => u.vegMode).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <SectionTitle
          eyebrow="Directory · Hub Club"
          subtitle="Contact numbers, dietary veg-mode preferences and saved addresses."
        >
          Customer address book
        </SectionTitle>

        <button onClick={loadUsers} className="btn-outline flex items-center gap-1.5 font-note text-xs font-semibold px-3.5 py-2 self-start">
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Search + stamps */}
      <div className="sc-card p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone number…"
            className="form-blank w-full pl-9 pr-3 py-2.5 font-note text-xs text-[var(--ink)] outline-none focus:border-[#681121]"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="stamp tilt-l-sm text-[#681121] border-[#681121]/45">
            {users.length} customers
          </span>
          <span className="stamp tilt-r-sm text-[#3d7044] border-[#4E8B56]/50">
            {vegCount} pure veg
          </span>
        </div>
      </div>

      {/* Address book table */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="sc-skeleton h-14 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty
          title="No one by that name"
          sub="Nothing in the address book matches your search. Try a different name, email or phone number."
        />
      ) : (
        <div className="sc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="sc-table w-full text-left text-xs">
              <thead>
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Dietary</th>
                  <th className="py-3.5 px-4">Saved addresses</th>
                  <th className="py-3.5 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]/70">
                {filtered.map((u) => {
                  const joinDate = new Date(u.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={u.id}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#681121] text-[#FDFBF7] flex items-center justify-center text-[11px] font-semibold shadow-sm shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-hand italic text-[15px] text-[#540c19]">
                            {u.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--ink)] font-note">
                          <Phone size={12} className="text-[#D48924]" />
                          <span>+91 {u.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--ink-faint)] font-note">
                          <Mail size={12} className="text-[var(--ink-faint)]" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.vegMode ? (
                          <span className="stamp text-[#3d7044] border-[#4E8B56]/50">
                            <span className="veg-badge" />
                            Pure veg
                          </span>
                        ) : (
                          <span className="font-note text-[11px] text-[var(--ink-faint)]">
                            Standard
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[var(--ink-soft)] font-note max-w-[260px]">
                        {u.addresses?.length ? (
                          <span className="flex items-start gap-1.5">
                            <MapPin size={12} className="text-[#681121] shrink-0 mt-0.5" />
                            <span className="truncate">{u.addresses.join(', ')}</span>
                          </span>
                        ) : (
                          <span className="text-[var(--ink-faint)] italic">None added yet</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[var(--ink-faint)] font-note whitespace-nowrap">
                        {joinDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
