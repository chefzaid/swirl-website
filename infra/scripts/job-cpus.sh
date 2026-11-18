#!/bin/sh
# Prints how many CPUs this job may use: its cgroup CPU quota, rounded up, or
# the visible processors without one. Worker pools sized from
# os.availableParallelism() see the node's threads, not the job's quota.
set -eu
quota=max
period=100000
if [ -r /sys/fs/cgroup/cpu.max ]; then
  read -r quota period < /sys/fs/cgroup/cpu.max
elif [ -r /sys/fs/cgroup/cpu/cpu.cfs_quota_us ] && [ -r /sys/fs/cgroup/cpu/cpu.cfs_period_us ]; then
  quota="$(cat /sys/fs/cgroup/cpu/cpu.cfs_quota_us)"
  period="$(cat /sys/fs/cgroup/cpu/cpu.cfs_period_us)"
fi
case "$quota" in
  max|-1|'') nproc ;;
  *) echo $(( (quota + period - 1) / period )) ;;
esac
