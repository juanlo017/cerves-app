import { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { rankingsApi, type RankingConfig, playersApi, groupsApi } from '@/lib/api';
import type { LeaderboardPlayer } from '@/lib/api/rankings';
import type { Group, GroupLeaderboardEntry } from '@/lib/api/groups';
import {
  Typography, SegmentedControl, LeaderboardItem, IconButton,
  GroupSelector, GroupManageModal,
} from '@/components/ui';
import { Theme } from '@/constants/Theme';

export default function RankingScreen() {
  const { player } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Group state
  const [groups, setGroups] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupLeaderboard, setGroupLeaderboard] = useState<GroupLeaderboardEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroupRole, setSelectedGroupRole] = useState<string | null>(null);

  const config: RankingConfig = {
    rankingPeriod: 'month',
    trendPeriod: 'daily',
  };

  useEffect(() => {
    if (player) loadGroups();
  }, [player]);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTab, monthOffset, selectedGroupId]);

  const loadGroups = async () => {
    if (!player) return;
    try {
      const data = await playersApi.getGroups(player.id);
      const mapped = data.map((gm: any) => ({
        id: gm.groups.id,
        name: gm.groups.name,
        role: gm.role,
      }));
      setGroups(mapped);
      if (mapped.length > 0 && !selectedGroupId) {
        setSelectedGroupId(mapped[0].id);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);

      if (selectedTab === 0) {
        const data = await rankingsApi.getLeaderboard(config, monthOffset);
        setLeaderboard(data);
      } else {
        if (selectedGroupId) {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
          const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);
          const periodStart = start.toISOString().split('T')[0];
          const periodEnd = end.toISOString().split('T')[0];

          const data = await groupsApi.getLeaderboard(selectedGroupId, periodStart, periodEnd);
          setGroupLeaderboard(data);
        } else {
          setGroupLeaderboard([]);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => setMonthOffset(monthOffset - 1);
  const goToNextMonth = () => {
    if (rankingsApi.canGoToNextMonth(monthOffset)) {
      setMonthOffset(monthOffset + 1);
    }
  };
  const goToCurrentMonth = () => setMonthOffset(0);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleOpenGroupInfo = async () => {
    if (!selectedGroupId || !player) return;
    const group = await groupsApi.getById(selectedGroupId);
    const role = await groupsApi.getMemberRole(selectedGroupId, player.user_id);
    setSelectedGroup(group);
    setSelectedGroupRole(role);
    setModalVisible(true);
  };

  const handleOpenCreateGroup = () => {
    setSelectedGroup(null);
    setSelectedGroupRole(null);
    setModalVisible(true);
  };

  const handleGroupCreated = (newGroup: Group) => {
    setGroups(prev => [...prev, { id: newGroup.id, name: newGroup.name, role: 'leader' }]);
    setSelectedGroupId(newGroup.id);
  };

  const handleGroupJoined = (joinedGroup: Group) => {
    setGroups(prev => [...prev, { id: joinedGroup.id, name: joinedGroup.name, role: 'member' }]);
    setSelectedGroupId(joinedGroup.id);
  };

  const handleGroupDeleted = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    if (selectedGroupId === groupId) {
      setSelectedGroupId(groups.length > 1 ? groups.find(g => g.id !== groupId)?.id || null : null);
    }
  };

  const periodName = rankingsApi.getPeriodName(config.rankingPeriod, monthOffset, config.customDays);
  const isCurrentMonth = monthOffset === 0;
  const canGoNext = rankingsApi.canGoToNextMonth(monthOffset);

  const renderEventosContent = () => {
    if (groups.length === 0) {
      return (
        <View style={styles.emptyEvents}>
          <Typography variant="h3" align="center" style={styles.emptyTitle}>
            SIN GRUPOS
          </Typography>
          <Typography variant="body" align="center" color={Theme.colors.textSecondary} style={styles.emptySubtitle}>
            Crea o unete a un grupo para ver el ranking
          </Typography>
          <TouchableOpacity style={styles.createButton} onPress={handleOpenCreateGroup}>
            <Typography variant="caption" style={styles.createButtonText}>
              CREAR / UNIRSE
            </Typography>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.eventosContainer}>
        <View style={styles.groupHeader}>
          <GroupSelector
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelect={handleGroupSelect}
          />
          <View style={styles.groupActions}>
            <TouchableOpacity style={styles.groupActionButton} onPress={handleOpenGroupInfo}>
              <Typography variant="caption" color={Theme.colors.primary}>INFO</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.groupActionButton} onPress={handleOpenCreateGroup}>
              <Typography variant="caption" color={Theme.colors.secondary}>+ NUEVO</Typography>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <Typography variant="body">Cargando...</Typography>
          </View>
        ) : (
          <FlatList
            data={groupLeaderboard}
            keyExtractor={(item) => item.player_id}
            renderItem={({ item }) => (
              <LeaderboardItem
                rank={item.rank}
                playerName={item.display_name}
                avatar={item.avatar_key}
                liters={item.total_liters}
                trend="same"
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Typography variant="body" color={Theme.colors.textSecondary}>
                  No hay datos para este mes
                </Typography>
              </View>
            }
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Month Navigator */}
      <View style={styles.monthNavigator}>
        <IconButton icon="◀" onPress={goToPreviousMonth} />

        <View style={styles.monthRangeContainer}>
          <Typography variant="h2" align="center">
            {periodName}
          </Typography>
          {!isCurrentMonth && (
            <TouchableOpacity onPress={goToCurrentMonth} style={styles.currentButton}>
              <Typography
                variant="caption"
                color={Theme.colors.background}
                style={{ fontFamily: Theme.fonts.pixel, fontSize: 10 }}
              >
                Mes actual
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        <IconButton icon="▶" onPress={goToNextMonth} disabled={!canGoNext} />
      </View>

      <View style={styles.header}>
        <Typography variant="h1" align="center" color={Theme.colors.primary}>
          TOP
        </Typography>
        <Typography variant="h2" align="center">
          PERJUDICADOS
        </Typography>
      </View>

      <View style={styles.tabContainer}>
        <SegmentedControl
          options={['GLOBAL', 'GRUPOS']}
          selectedIndex={selectedTab}
          onSelect={setSelectedTab}
        />
      </View>

      {selectedTab === 0 ? (
        isLoading ? (
          <View style={styles.loading}>
            <Typography variant="body">Cargando...</Typography>
          </View>
        ) : (
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.player_id}
            renderItem={({ item }) => (
              <LeaderboardItem
                rank={item.rank}
                playerName={item.player_name}
                avatar={item.avatar}
                liters={item.total_liters}
                trend={item.trend}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Typography variant="body" color={Theme.colors.textSecondary}>
                  No hay datos para este mes
                </Typography>
              </View>
            }
          />
        )
      ) : (
        renderEventosContent()
      )}

      {/* Group Manage Modal */}
      {player && (
        <GroupManageModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          group={selectedGroup}
          currentUserId={player.user_id}
          isLeader={selectedGroupRole === 'leader'}
          onGroupCreated={handleGroupCreated}
          onGroupDeleted={handleGroupDeleted}
          onGroupJoined={handleGroupJoined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.backgroundLight,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.border,
  },
  monthRangeContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.md,
  },
  currentButton: {
    marginTop: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.lg,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  tabContainer: {
    paddingVertical: Theme.spacing.md,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: Theme.spacing.sm,
  },
  empty: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  eventosContainer: {
    flex: 1,
  },
  groupHeader: {
    paddingHorizontal: Theme.spacing.md,
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: Theme.spacing.sm,
  },
  groupActionButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.xs,
  },
  emptyEvents: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyTitle: {
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    marginBottom: Theme.spacing.lg,
  },
  createButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
  },
  createButtonText: {
    color: Theme.colors.background,
    fontWeight: 'bold' as const,
  },
});
